import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { StoreState, UserSettings, FinancialData, DEFAULT_SETTINGS, INITIAL_DATA, Income, FixedExpense, Debt, VariableExpense, SavingGoal } from '../types';
import { useAuth } from './AuthContext';
import { calculateRealHourlyRate, calculateTotalIncome, calculateTotalFixedExpenses } from '../utils/finance';
import { getHolidays } from '../utils/holidays';

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [data, setData] = useState<FinancialData>(INITIAL_DATA);
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);

  console.log('[StoreContext] Provider rendering. isStoreLoaded:', isStoreLoaded, 'user:', user?.id);

  // Load data on mount or user change
  useEffect(() => {
    const loadLocalData = () => {
      const storageKeySuffix = user?.id || 'guest';
      const savedSettings = localStorage.getItem(`flux_settings_${storageKeySuffix}`);
      const savedData = localStorage.getItem(`flux_data_${storageKeySuffix}`);

      if (savedSettings) setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));

      if (savedData) setData(prev => ({ ...prev, ...JSON.parse(savedData) }));

      setIsStoreLoaded(true);
    };

    loadLocalData();
  }, [user]);

  // Persist data on change
  useEffect(() => {
    if (isStoreLoaded) {
      const storageKeySuffix = user?.id || 'guest';
      localStorage.setItem(`flux_settings_${storageKeySuffix}`, JSON.stringify(settings));
      localStorage.setItem(`flux_data_${storageKeySuffix}`, JSON.stringify(data));
    }
  }, [settings, data, user, isStoreLoaded]);

  // GLOBAL THEME APPLICATION
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // --- CALCULATED VALUES (PHASE 7.5: NOMINAL INDEPENDENCE) ---

  const calculatedHourlyRate = useMemo(() => {
    // If not loaded yet, we still want to calculate based on default INITIAL_DATA if possible
    const salaryToUse = data.nominalBaseSalary || 0;
    const salaryCurrency = data.nominalBaseCurrency || settings.baseCurrency;

    console.log('[StoreContext] useMemo calculation start:', { salaryToUse, salaryCurrency, isStoreLoaded });

    // Convert to Base Currency
    const normalizedSalary = calculateTotalIncome(
      [{ id: 'nominal', name: 'Nominal', amount: salaryToUse, currency: salaryCurrency, type: 'fixed_date', dayValue: 1 }],
      settings.baseCurrency,
      data.exchangeRate
    );

    const allHolidays = getHolidays(settings.customHolidays);
    const calculated = calculateRealHourlyRate(normalizedSalary, allHolidays);
    const finalRate = Math.round(calculated * 100) / 100;

    console.log('[StoreContext] useMemo calculation end:', { normalizedSalary, calculated, finalRate });

    return finalRate;
  }, [data.nominalBaseSalary, data.nominalBaseCurrency, data.exchangeRate, settings.baseCurrency, settings.customHolidays, isStoreLoaded]);

  // Sync the memoized result back to state for persistence
  useEffect(() => {
    if (isStoreLoaded && Math.abs((data.hourlyRate || 0) - calculatedHourlyRate) > 0.01) {
      console.log('[StoreContext] Syncing state with calculatedHourlyRate:', calculatedHourlyRate);
      setData(prev => ({ ...prev, hourlyRate: calculatedHourlyRate }));
    }
  }, [calculatedHourlyRate, isStoreLoaded, data.hourlyRate]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateData = (newData: Partial<FinancialData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  // --- INCOME ACTIONS ---
  const addIncome = (income: Income) => {
    setData(prev => ({ ...prev, incomes: [...prev.incomes, income] }));
  };

  const updateIncome = (id: string, income: Partial<Income>) => {
    setData(prev => ({
      ...prev,
      incomes: prev.incomes.map(i => i.id === id ? { ...i, ...income } : i)
    }));
  };

  const removeIncome = (id: string) => {
    setData(prev => ({ ...prev, incomes: prev.incomes.filter(i => i.id !== id) }));
  };

  // --- FIXED EXPENSE ACTIONS ---
  const addFixedExpense = (expense: FixedExpense) => {
    setData(prev => ({ ...prev, fixedExpenses: [...prev.fixedExpenses, expense] }));
  };

  const updateFixedExpense = (id: string, expense: Partial<FixedExpense>) => {
    setData(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(e => e.id === id ? { ...e, ...expense } : e)
    }));
  };

  const removeFixedExpense = (id: string) => {
    setData(prev => ({ ...prev, fixedExpenses: prev.fixedExpenses.filter(e => e.id !== id) }));
  };

  const toggleExpensePaid = (id: string) => {
    setData(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(exp =>
        exp.id === id ? { ...exp, isPaid: !exp.isPaid } : exp
      )
    }));
  };

  // --- VARIABLE EXPENSE ACTIONS (PHASE 5) ---
  const addVariableExpense = (expense: VariableExpense) => {
    setData(prev => ({
      ...prev,
      // Ensure array exists (migration safety) and prepend new expense
      variableExpenses: [expense, ...(prev.variableExpenses || [])]
    }));
  };

  const addVariableExpenses = (expenses: VariableExpense[]) => {
    setData(prev => ({
      ...prev,
      variableExpenses: [...expenses, ...(prev.variableExpenses || [])]
    }));
  };

  const updateVariableExpense = (id: string, expense: Partial<VariableExpense>) => {
    setData(prev => ({
      ...prev,
      variableExpenses: (prev.variableExpenses || []).map(e => e.id === id ? { ...e, ...expense } : e)
    }));
  };

  const removeVariableExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      variableExpenses: (prev.variableExpenses || []).filter(e => e.id !== id)
    }));
  };

  // --- DEBT ACTIONS ---
  const addDebt = (debt: Debt) => {
    setData(prev => ({ ...prev, debts: [...(prev.debts || []), debt] }));
  };

  const updateDebt = (id: string, debt: Partial<Debt>) => {
    setData(prev => ({
      ...prev,
      debts: prev.debts.map(d => d.id === id ? { ...d, ...debt } : d)
    }));
  };

  const removeDebt = (id: string) => {
    setData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
  };

  // --- SAVING GOALS ACTIONS (PHASE 6) ---
  const addSavingGoal = (goal: SavingGoal) => {
    setData(prev => ({ ...prev, savingGoals: [...(prev.savingGoals || []), goal] }));
  };

  const updateSavingGoal = (id: string, goal: Partial<SavingGoal>) => {
    setData(prev => ({
      ...prev,
      savingGoals: (prev.savingGoals || []).map(g => g.id === id ? { ...g, ...goal } : g)
    }));
  };

  const removeSavingGoal = (id: string) => {
    setData(prev => ({ ...prev, savingGoals: (prev.savingGoals || []).filter(g => g.id !== id) }));
  };


  const syncData = async () => {
    console.log("Syncing to cloud...");
    await new Promise(r => setTimeout(r, 500));
    console.log("Synced.");
  };

  return (
    <StoreContext.Provider value={{
      settings,
      data,
      updateSettings,
      updateData,
      addIncome,
      updateIncome,
      removeIncome,
      addFixedExpense,
      updateFixedExpense,
      removeFixedExpense,
      toggleExpensePaid,
      addVariableExpense,
      addVariableExpenses,
      updateVariableExpense,
      removeVariableExpense,
      addDebt,
      updateDebt,
      removeDebt,
      addSavingGoal,
      updateSavingGoal,
      removeSavingGoal,
      syncData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};