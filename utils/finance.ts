import { Holiday, Income, FixedExpense, Currency, IncomeType, Debt, PaymentStrategy, VariableExpense, ExpenseCategory, ExpenseImportance, Language, SavingGoal, FinancialData, UserSettings } from '../types';

// --- Security & Sanitization Utilities ---

/**
 * Filtra caracteres peligrosos y tags HTML de un string para evitar XSS
 * incluso si React escapa por defecto, esto mantiene los datos limpios en el estado.
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Elimina etiquetas HTML
    .replace(/[<>]/g, '')     // Elimina caracteres < y >
    .trim();
};

/**
 * Asegura que un valor financiero sea un número positivo y válido.
 * Previene errores de cálculo por NaN o valores negativos inyectados.
 */
export const validateFinancialInput = (value: any): number => {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.abs(num);
};

export const getCategoryLabel = (cat: ExpenseCategory, lang: Language): string => {
  const map: Record<ExpenseCategory, { es: string, en: string }> = {
    food: { es: 'Alimentación', en: 'Food' },
    transport: { es: 'Transporte', en: 'Transport' },
    housing: { es: 'Vivienda', en: 'Housing' },
    utilities: { es: 'Servicios', en: 'Utilities' },
    loans: { es: 'Préstamos', en: 'Loans' },
    subscription: { es: 'Suscripciones', en: 'Subscriptions' },
    education: { es: 'Educación', en: 'Education' },
    leisure: { es: 'Ocio', en: 'Leisure' },
    health: { es: 'Salud', en: 'Health' },
    other: { es: 'Varios', en: 'Other' }
  };
  return lang === 'es-UY' ? map[cat].es : map[cat].en;
};

export const getImportanceLabel = (imp: ExpenseImportance, lang: Language): string => {
  const map: Record<ExpenseImportance, { es: string, en: string }> = {
    vital: { es: 'Vital', en: 'Vital' },
    flexible: { es: 'Flexible', en: 'Flexible' },
    leisure: { es: 'Ocio', en: 'Leisure' }
  };
  return lang === 'es-UY' ? map[imp].es : map[imp].en;
};

// --- Date Helpers ---

export const getLocalISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parses a YYYY-MM-DD string into a local Date object at 00:00:00.
 * Avoids the UTC offset shift of `new Date(string)`.
 */
export const parseISODate = (isoStr: string): Date => {
  if (!isoStr || !isoStr.includes('-')) return new Date();
  const [year, month, day] = isoStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? new Date() : date;
};

export const formatDateLabel = (isoStr: string, language: string): string => {
  const date = parseISODate(isoStr);
  return date.toLocaleDateString(language, { day: 'numeric', month: 'short' });
};

const isNonWorkingDay = (date: Date, holidays: Holiday[]): boolean => {
  const dateStr = getLocalISODate(date);

  const isHoliday = (holidays || []).some(h => h.date === dateStr);
  return date.getDay() === 0 || date.getDay() === 6 || isHoliday; // 0=Sun, 6=Sat
};

// --- Payday Logic ---

export const calculatePayday = (dayValue: number, type: IncomeType, holidays: Holiday[]): Date => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // Current month

  if (type === 'fixed_date') {
    // Strategy: Move BACKWARD if non-working
    let targetDate = new Date(year, month, dayValue);

    // If date is invalid (e.g., Feb 30), JS automatically rolls over. 
    // We should clamp to last day of month first.
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    if (dayValue > lastDayOfMonth) targetDate = new Date(year, month, lastDayOfMonth);

    // If day has passed, maybe show next month? For now, let's show current month projection
    // or next month if today > targetDate. 
    if (today.getDate() > targetDate.getDate()) {
      targetDate = new Date(year, month + 1, dayValue);
    }

    // Move backward logic
    while (isNonWorkingDay(targetDate, holidays)) {
      targetDate.setDate(targetDate.getDate() - 1);
    }
    return targetDate;

  } else {
    // Strategy: 'business_day' (e.g. 5th business day) -> Count forward
    // If today is past the calculated date, calculate for next month
    let targetDate = getBusinessDayDate(year, month, dayValue, holidays);

    if (today > targetDate) {
      targetDate = getBusinessDayDate(year, month + 1, dayValue, holidays);
    }
    return targetDate;
  }
};

const getBusinessDayDate = (year: number, month: number, businessDayCount: number, holidays: Holiday[]): Date => {
  let current = new Date(year, month, 1);
  let count = 0;

  // Safety loop
  while (count < businessDayCount && current.getDate() < 32) {
    if (!isNonWorkingDay(current, holidays)) {
      count++;
    }
    if (count < businessDayCount) {
      current.setDate(current.getDate() + 1);
    }
  }
  return current;
};

// --- Currency & Totals ---

export const convertToCurrency = (amount: number, from: Currency, to: Currency, exchangeRate: number): number => {
  if (from === to) return amount;
  // Simple conversion logic for UYU/USD
  // Safety buffer logic should happen in the UI or Store before calling this, or passed as a modified rate
  if (from === 'USD' && to === 'UYU') return amount * exchangeRate;
  if (from === 'UYU' && to === 'USD') return amount / exchangeRate;
  return amount;
};

export const calculateTotalIncome = (incomes: Income[], baseCurrency: Currency, exchangeRate: number): number => {
  return incomes.reduce((acc, inc) => {
    return acc + convertToCurrency(inc.amount, inc.currency, baseCurrency, exchangeRate);
  }, 0);
};

export const calculateTotalFixedExpenses = (expenses: FixedExpense[], baseCurrency: Currency, exchangeRate: number): number => {
  return expenses.reduce((acc, exp) => {
    return acc + convertToCurrency(exp.amount, exp.currency, baseCurrency, exchangeRate);
  }, 0);
};

export const calculateSequestration = (expenses: FixedExpense[], baseCurrency: Currency, exchangeRate: number): { total: number, paid: number, pending: number } => {
  let total = 0;
  let paid = 0;

  expenses.forEach(exp => {
    const amount = convertToCurrency(exp.amount, exp.currency, baseCurrency, exchangeRate);
    total += amount;
    if (exp.isPaid) paid += amount;
  });

  return { total, paid, pending: total - paid };
};

// Phase 6: Savings Total
export const calculateTotalSavingsContribution = (goals: SavingGoal[], baseCurrency: Currency, exchangeRate: number): number => {
  return goals.reduce((acc, g) => {
    return acc + convertToCurrency(g.monthlyContribution, g.currency, baseCurrency, exchangeRate);
  }, 0);
};

// --- Phase 4, 5 & 6 Calculations ---

export const calculateDailyBudget = (
  totalIncome: number,
  fixedExpensesTotal: number,
  debtsMinPaymentTotal: number,
  savingsContributionTotal: number,
  peaceOfMindPercentage: number,
  daysInMonth: number,
  currentDay: number,
  variableExpenses: VariableExpense[],
  baseCurrency: Currency,
  exchangeRate: number
): number => {
  const peaceOfMindFund = totalIncome * (peaceOfMindPercentage / 100);

  // 1. Initial Disposable Income for the month
  const initialDisposable = totalIncome - fixedExpensesTotal - debtsMinPaymentTotal - savingsContributionTotal - peaceOfMindFund;

  if (initialDisposable <= 0) return 0;

  // 2. Calculate spent UNTIL YESTERDAY (current month)
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayISODate = getLocalISODate(today);

  const spentUntilYesterday = (variableExpenses || [])
    .filter(e => {
      const d = new Date(e.date);
      // We use e.date directly since it's already YYYY-MM-DD
      // Same month and year, but NOT today
      return d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear &&
        e.date !== todayISODate;
    })
    .reduce((acc, e) => {
      return acc + convertToCurrency(e.amount, e.currency, baseCurrency, exchangeRate);
    }, 0);

  // 3. Residual Pot = Initial - Spent
  const residualPot = initialDisposable - spentUntilYesterday;

  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  // 4. Real Daily Allowance (recalibrated)
  return Math.max(0, residualPot / daysRemaining);
};

// Phase 5: Calculate how much was spent TODAY
export const calculateTodaySpend = (
  expenses: VariableExpense[],
  baseCurrency: Currency,
  exchangeRate: number
): number => {
  const todayISODate = getLocalISODate(new Date());

  return (expenses || [])
    .filter(e => e.date === todayISODate)
    .reduce((acc, e) => {
      return acc + convertToCurrency(e.amount, e.currency, baseCurrency, exchangeRate);
    }, 0);
};

export const sortDebts = (debts: Debt[], strategy: PaymentStrategy, baseCurrency: Currency, exchangeRate: number): Debt[] => {
  return [...(debts || [])].sort((a, b) => {
    if (strategy === 'snowball') {
      // Sort by lowest remaining amount first
      const amountA = convertToCurrency(a.remainingAmount, a.currency, baseCurrency, exchangeRate);
      const amountB = convertToCurrency(b.remainingAmount, b.currency, baseCurrency, exchangeRate);
      return amountA - amountB;
    } else {
      // Avalanche: Sort by highest interest rate first
      return b.interestRate - a.interestRate;
    }
  });
};

// --- Gamification ---

export const calculateRealHourlyRate = (
  monthlyNetIncome: number,
  holidays: Holiday[]
): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (!isNonWorkingDay(date, holidays)) {
      workingDays++;
    }
  }

  console.log(`[Finance] ${year}-${month + 1} Working Days:`, workingDays, 'Days in Month:', daysInMonth);

  const standardHoursPerDay = 8; // Convention
  const totalHours = workingDays * standardHoursPerDay;

  if (totalHours === 0) return 0;
  return monthlyNetIncome / totalHours;
};

// --- Flux Auditor: Intelligent Insights ---

export interface Insight {
  id: string;
  type: 'alert' | 'tip' | 'success' | 'info';
  title: string;
  message: string;
  icon: string;
}

export const generateDailyInsights = (
  data: FinancialData,
  settings: UserSettings,
  daysInMonth: number,
  currentDayValue: number
): Insight[] => {
  const insights: Insight[] = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // 1. Pending Fixed Expenses Alert (Next 3 days)
  const pendingFixed = (data.fixedExpenses || []).filter(e => !e.isPaid);
  pendingFixed.forEach(exp => {
    if (exp.dueDate >= currentDayValue && exp.dueDate <= currentDayValue + 3) {
      insights.push({
        id: `fixed-${exp.id}`,
        type: 'alert',
        title: 'Gasto Próximo',
        message: `Mañana o pronto vence "${exp.name}" (${exp.currency} ${exp.amount}). ¡No olvides marcarlo como pago!`,
        icon: 'AlertCircle'
      });
    }
  });

  // 2. Budget Health Insight (Burn rate)
  const totalIncome = calculateTotalIncome(data.incomes, settings.baseCurrency, data.exchangeRate);
  const fixedTotal = calculateTotalFixedExpenses(data.fixedExpenses, settings.baseCurrency, data.exchangeRate);
  const peaceOfMindFund = totalIncome * (settings.peaceOfMindPercentage / 100);

  // Disposable for the month (Initial)
  const savingsContr = calculateTotalSavingsContribution(data.savingGoals, settings.baseCurrency, data.exchangeRate);
  const initialDisposable = totalIncome - fixedTotal - peaceOfMindFund - savingsContr;

  if (initialDisposable > 0) {
    const todayISODate = getLocalISODate(today);
    const spentThisMonth = (data.variableExpenses || [])
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.date !== todayISODate;
      })
      .reduce((acc, e) => acc + convertToCurrency(e.amount, e.currency, settings.baseCurrency, data.exchangeRate), 0);

    // AI Auditor: Vampire Detection (Phase 19)
    const vampires = detectVampireExpenses(data.variableExpenses || [], settings.baseCurrency, data.exchangeRate);
    if (vampires.length > 0) {
      const topVampire = vampires[0];
      const formattedLost = new Intl.NumberFormat('es-UY', { style: 'currency', currency: settings.baseCurrency, maximumFractionDigits: 0 }).format(topVampire.projection5Y);

      insights.push({
        id: 'vampire-leak',
        type: 'alert',
        title: '¡Gasto Vampiro Detectado!',
        message: `"${topVampire.description}" se repite mucho. Te sacará ${formattedLost} en 5 años si no lo cortas ya.`,
        icon: 'ShieldAlert'
      });
    }

    const burnRatePercent = (spentThisMonth / initialDisposable) * 100;
    const monthProgressPercent = (currentDayValue / daysInMonth) * 100;

    if (burnRatePercent > monthProgressPercent + 15) {
      insights.push({
        id: 'burn-rate-warning',
        type: 'alert',
        title: 'Ritmo de Gasto Alto',
        message: `Has consumido el ${Math.round(burnRatePercent)}% de tu presupuesto, pero solo ha pasado el ${Math.round(monthProgressPercent)}% del mes. ¡Baja el ritmo!`,
        icon: 'TrendingUp'
      });
    } else if (burnRatePercent < monthProgressPercent - 10) {
      insights.push({
        id: 'burn-rate-good',
        type: 'success',
        title: 'Excelente Control',
        message: 'Tu ritmo de gasto está por debajo de lo previsto. ¡Sigue así!',
        icon: 'ShieldCheck'
      });
    }
  }

  // 3. Peace of Mind Fund Status
  if (settings.peaceOfMindPercentage > 0) { // Changed peaceOfMindPercentage to settings.peaceOfMindPercentage
    // Small tip about the fund
    insights.push({
      id: 'peace-fund-tip',
      type: 'info',
      title: 'Protección Activada',
      message: `Estás reservando el ${settings.peaceOfMindPercentage}% para tu pozo de paz mental. Muy bien.`,
      icon: 'Shield'
    });
  }

  // 4. Saving Goals Motivation
  const goalsWithProgress = (data.savingGoals || []).filter(g => g.currentAmount >= g.targetAmount * 0.9 && g.currentAmount < g.targetAmount);
  goalsWithProgress.forEach(g => {
    insights.push({
      id: `goal-near-${g.id}`,
      type: 'success',
      title: '¡Casi lo logras!',
      message: `Tu cofre "${g.name}" está al ${Math.round((g.currentAmount / g.targetAmount) * 100)}%. ¡Falta muy poco!`,
      icon: 'Rocket'
    });
  });

  return insights.slice(0, 3); // Max 3 insights as planned
};

export const calculatePulseData = (
  data: FinancialData,
  settings: UserSettings,
  daysInMonth: number,
  currentDay: number
) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const baseCurrency = settings.baseCurrency;
  const exchangeRate = data.exchangeRate;

  // 1. Calcular el presupuesto inicial disponible para el mes
  const totalIncome = calculateTotalIncome(data.incomes, baseCurrency, exchangeRate);
  const fixedTotal = calculateTotalFixedExpenses(data.fixedExpenses, baseCurrency, exchangeRate);
  const peaceOfMindFund = totalIncome * (settings.peaceOfMindPercentage / 100);
  const savingsContr = calculateTotalSavingsContribution(data.savingGoals, baseCurrency, exchangeRate);
  const initialDisposable = totalIncome - fixedTotal - peaceOfMindFund - savingsContr;

  // 2. Generar puntos de datos diarios (Gasto Acumulado vs Ideal)
  const burnPoints: { day: number, spent: number, ideal: number }[] = [];
  let accumulatedSpent = 0;
  const dailyIdeal = initialDisposable / daysInMonth;

  for (let i = 1; i <= daysInMonth; i++) {
    const dailyExpenses = (data.variableExpenses || [])
      .filter(e => {
        const d = new Date(e.date);
        return d.getDate() === i && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, e) => acc + convertToCurrency(e.amount, e.currency, baseCurrency, exchangeRate), 0);

    accumulatedSpent += dailyExpenses;

    // Solo agregamos puntos hasta el día actual para el gasto real
    burnPoints.push({
      day: i,
      spent: i <= currentDay ? accumulatedSpent : 0,
      ideal: dailyIdeal * i
    });
  }

  return {
    initialDisposable,
    burnPoints,
    currentSpent: accumulatedSpent,
    remaining: initialDisposable - accumulatedSpent
  };
};

export const predictDayZero = (
  initialDisposable: number,
  currentSpent: number,
  currentDay: number,
  daysInMonth: number
): { day: number, isCritical: boolean } | null => {
  if (currentDay === 0 || initialDisposable <= 0) return null;

  const averageDailySpend = currentSpent / currentDay;
  if (averageDailySpend <= 0) return { day: daysInMonth, isCritical: false };

  const projectedDayZero = Math.floor(initialDisposable / averageDailySpend);
  const day = Math.min(Math.max(1, projectedDayZero), daysInMonth + 1);

  return {
    day: day > daysInMonth ? daysInMonth : day,
    isCritical: day <= daysInMonth
  };
};

export const calculatePreviousMonthLeftover = (
  data: FinancialData,
  settings: UserSettings
): number => {
  const d = new Date();
  // Ir al último día del mes pasado
  const lastMonth = new Date(d.getFullYear(), d.getMonth(), 0);
  const prevMonth = lastMonth.getMonth();
  const prevYear = lastMonth.getFullYear();

  const baseCurrency = settings.baseCurrency;
  const exchangeRate = data.exchangeRate;

  // 1. Ingresos del mes pasado
  const totalIncome = data.incomes.reduce((acc, inc) =>
    acc + convertToCurrency(inc.amount, inc.currency, baseCurrency, exchangeRate), 0);

  // 2. Gastos fijos del mes pasado
  const fixedTotal = data.fixedExpenses.reduce((acc, exp) =>
    acc + convertToCurrency(exp.amount, exp.currency, baseCurrency, exchangeRate), 0);

  // 3. Paz mental y ahorros configurados
  const peaceOfMindFund = totalIncome * (settings.peaceOfMindPercentage / 100);
  const savingsContr = calculateTotalSavingsContribution(data.savingGoals, baseCurrency, exchangeRate);

  // 4. Gastos variables del mes pasado
  const spentLastMonth = (data.variableExpenses || [])
    .filter(e => {
      const expDate = new Date(e.date);
      return expDate.getMonth() === prevMonth && expDate.getFullYear() === prevYear;
    })
    .reduce((acc, e) => acc + convertToCurrency(e.amount, e.currency, baseCurrency, exchangeRate), 0);

  // El sobrante es: Lo que quedó después de fijos y ahorros configurados - lo que se gastó en el día a día
  const leftover = totalIncome - fixedTotal - peaceOfMindFund - savingsContr - spentLastMonth;

  return Math.max(0, leftover);
};

export const detectVampireExpenses = (
  expenses: VariableExpense[],
  baseCurrency: Currency,
  exchangeRate: number
) => {
  // 1. Agrupar por descripción (normalizada)
  const groups: Record<string, VariableExpense[]> = {};

  expenses.forEach(e => {
    const desc = e.description.toLowerCase().trim();
    if (!groups[desc]) groups[desc] = [];
    groups[desc].push(e);
  });

  const vampires: {
    description: string;
    monthlyAmount: number;
    count: number;
    projection5Y: number;
  }[] = [];

  // 2. Identificar patrones recurrentes (al menos 2 ocurrencias en meses distintos)
  Object.entries(groups).forEach(([desc, list]) => {
    if (list.length < 2) return;

    // Obtener meses únicos
    const months = new Set(list.map(e => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));

    if (months.size >= 2) {
      // Calcular promedio de monto en moneda base
      const totalInBase = list.reduce((acc, e) =>
        acc + convertToCurrency(e.amount, e.currency, baseCurrency, exchangeRate), 0);
      const avgAmount = totalInBase / list.length;

      // Un "Vampiro" suele ser algo pequeño pero constante (< 10% del ingreso promedio aprox, pero aquí lo dejamos libre)
      vampires.push({
        description: list[0].description, // Mantener capitalización original de la primera ocurrencia
        monthlyAmount: avgAmount,
        count: months.size,
        projection5Y: avgAmount * 12 * 5
      });
    }
  });

  return vampires.sort((a, b) => b.projection5Y - a.projection5Y);
};