import { Holiday, Income, FixedExpense, Currency, IncomeType, Debt, PaymentStrategy, VariableExpense, ExpenseCategory, ExpenseImportance, Language, SavingGoal } from '../types';

// --- Localization Maps ---

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

const isNonWorkingDay = (date: Date, holidays: Holiday[]): boolean => {
  const day = date.getDay();
  // Robust local YYYY-MM-DD comparison to avoid timezone shifts with toISOString()
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${dayOfMonth}`;

  const isHoliday = (holidays || []).some(h => h.date === dateStr);
  return day === 0 || day === 6 || isHoliday; // 0=Sun, 6=Sat
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
  peaceOfMindPercentage: number, // Nuevo parámetro
  daysInMonth: number,
  currentDay: number
): number => {
  const peaceOfMindFund = totalIncome * (peaceOfMindPercentage / 100);

  // Disposable Income = Income - (Expenses + Debts + Savings + Peace of Mind)
  const disposableIncome = totalIncome - fixedExpensesTotal - debtsMinPaymentTotal - savingsContributionTotal - peaceOfMindFund;

  if (disposableIncome <= 0) return 0;

  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  // Theoretical Daily Allowance
  return disposableIncome / daysRemaining;
};

// Phase 5: Calculate how much was spent TODAY
export const calculateTodaySpend = (
  expenses: VariableExpense[],
  baseCurrency: Currency,
  exchangeRate: number
): number => {
  const todayStr = new Date().toDateString();

  return (expenses || [])
    .filter(e => new Date(e.date).toDateString() === todayStr)
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