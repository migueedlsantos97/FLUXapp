// Domain Entities

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider?: 'local' | 'google';
}

export type Currency = 'UYU' | 'USD' | 'UI' | 'UR';
export type Theme = 'light' | 'dark';
export type GuardianMode = 'military' | 'analytic' | 'colleague';
export type Language = 'es-UY' | 'en-US';

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'national' | 'corporate';
}

export interface UserSettings {
  setupComplete: boolean;
  country: string;
  language: Language;
  baseCurrency: Currency;
  theme: Theme;
  guardianMode: GuardianMode;
  customHolidays: Holiday[];
  peaceOfMindPercentage: number; // Porcentaje de ahorro para fondo de paz
  vaultPIN?: string; // PIN de seguridad cifrado (hash simple)
}

export type IncomeType = 'fixed_date' | 'business_day';

export interface Income {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  type: IncomeType;
  dayValue: number; // If fixed_date: Day 1-31. If business_day: The Nth business day (e.g., 5th).
}

export type ExpenseCategory = 'housing' | 'utilities' | 'loans' | 'subscription' | 'education' | 'food' | 'transport' | 'leisure' | 'health' | 'other';
export type ExpensePriority = 'vital' | 'subscription';

// Phase 5: New Levels
export type ExpenseImportance = 'vital' | 'flexible' | 'leisure';

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  priority: ExpensePriority;
  dueDate: number; // 1-31
  isPaid: boolean; // Monthly reset logic will handle this in future phases
}

export interface VariableExpense {
  id: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  description: string;
  importance: ExpenseImportance; // New
  isImpulsive: boolean; // New
  date: string; // ISO String for exact timestamp
  timestamp: number;
}

export type PaymentStrategy = 'snowball' | 'avalanche';

export interface Debt {
  id: string;
  name: string;
  totalAmount: number; // The full debt amount
  remainingAmount: number; // Calculated: (totalAmount / totalInstallments) * (totalInstallments - paidInstallments)
  currency: Currency;
  interestRate: number; // TEA %
  minimumPayment: number;

  // Installment Logic
  totalInstallments: number;
  paidInstallments: number;
}

// Phase 6: Savings
export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number; // Amount deducted from daily budget
  currency: Currency;
  icon: string; // Emoji or Lucide icon name
  color: string; // Tailwind color class
  deadline?: string; // ISO Date
}

export interface FinancialData {
  incomes: Income[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  debts: Debt[];
  savingGoals: SavingGoal[]; // New
  paymentStrategy: PaymentStrategy;
  balance: number; // Current liquidity (cash on hand) - used for Confession Mode later
  exchangeRate: number; // UYU value of 1 USD
  hourlyRate: number; // Calculated dynamic value
  nominalBaseSalary: number; // Nueva Fase 7.5: Sueldo de referencia para Valor Hora
  nominalBaseCurrency: Currency; // Nueva Fase 7.5: Moneda del sueldo de referencia
  lastSweptMonth?: string; // YYYY-MM
}

// Context States

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

export interface StoreState {
  settings: UserSettings;
  data: FinancialData;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateData: (data: Partial<FinancialData>) => void;

  // Income Actions
  addIncome: (income: Income) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  removeIncome: (id: string) => void;

  // Expense Actions
  addFixedExpense: (expense: FixedExpense) => void;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void;
  removeFixedExpense: (id: string) => void;
  toggleExpensePaid: (id: string) => void;

  // Variable Expense Actions (Phase 5)
  addVariableExpense: (expense: VariableExpense) => void;
  addVariableExpenses: (expenses: VariableExpense[]) => void; // New
  updateVariableExpense: (id: string, expense: Partial<VariableExpense>) => void; // New
  removeVariableExpense: (id: string) => void;

  // Debt Actions
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  removeDebt: (id: string) => void;

  // Saving Actions (Phase 6)
  addSavingGoal: (goal: SavingGoal) => void;
  updateSavingGoal: (id: string, goal: Partial<SavingGoal>) => void;
  removeSavingGoal: (id: string) => void;

  syncData: () => Promise<void>;

  // Security Actions
  vaultIsLocked: boolean;
  setVaultPIN: (pin: string | null) => void;
  unlockVault: (pin: string) => boolean;
  lockVault: () => void;
}

export const DEFAULT_SETTINGS: UserSettings = {
  setupComplete: false,
  country: 'UY',
  language: 'es-UY',
  baseCurrency: 'UYU',
  theme: 'light',
  guardianMode: 'analytic',
  customHolidays: [],
  peaceOfMindPercentage: 10,
};

export const INITIAL_DATA: FinancialData = {
  incomes: [],
  fixedExpenses: [],
  variableExpenses: [],
  debts: [],
  savingGoals: [],
  paymentStrategy: 'snowball',
  balance: 0,
  exchangeRate: 40.5,
  hourlyRate: 0,
  nominalBaseSalary: 0,
  nominalBaseCurrency: 'UYU',
  lastSweptMonth: '',
};