import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { VariableExpense, ExpenseCategory, ExpenseImportance, Currency } from '../types';
import { convertToCurrency, getCategoryLabel, getImportanceLabel } from '../utils/finance';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { 
    Utensils, Bus, ShoppingBag, Zap as ZapIcon, MoreHorizontal, 
    Trash2, Pencil, Filter, TrendingUp, AlertCircle, HeartPulse, Search,
    ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';

export const TransactionsModule: React.FC = () => {
  const { data, removeVariableExpense, updateVariableExpense, settings } = useStore();
  
  // State
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Edit Form State
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // --- Date Logic ---
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const monthNamesEs = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = settings.language === 'es-UY' ? monthNamesEs[currentMonth] : monthNamesEn[currentMonth];

  // --- Filter Logic ---
  const allExpenses = data.variableExpenses || [];
  
  // 1. Filter by Date (Month/Year)
  const expensesInMonth = allExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // 2. Filter by Category
  const filteredExpenses = expensesInMonth.filter(e => {
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      return true;
  });

  // --- Analytics Calculation ---
  const analytics = useMemo(() => {
      let vital = 0;
      let flexible = 0;
      let leisure = 0;
      let total = 0;

      expensesInMonth.forEach(e => {
          const val = convertToCurrency(e.amount, e.currency, settings.baseCurrency, data.exchangeRate);
          total += val;
          if (e.importance === 'vital') vital += val;
          else if (e.importance === 'flexible') flexible += val;
          else leisure += val;
      });

      return { total, vital, flexible, leisure };
  }, [expensesInMonth, settings.baseCurrency, data.exchangeRate]);


  const getCategoryIcon = (cat: ExpenseCategory) => {
      switch(cat) {
          case 'food': return <Utensils className="w-4 h-4 text-orange-500" />;
          case 'transport': return <Bus className="w-4 h-4 text-blue-500" />;
          case 'leisure': return <ShoppingBag className="w-4 h-4 text-purple-500" />;
          case 'utilities': return <ZapIcon className="w-4 h-4 text-yellow-500" />;
          case 'health': return <HeartPulse className="w-4 h-4 text-red-500" />;
          default: return <MoreHorizontal className="w-4 h-4 text-slate-400" />;
      }
  };

  const getImportanceColor = (imp: ExpenseImportance) => {
      switch(imp) {
          case 'vital': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
          case 'flexible': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
          case 'leisure': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
          default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      }
  };

  const formatMoney = (amount: number, curr: Currency) => {
    return new Intl.NumberFormat(settings.language, { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(amount);
  };

  const startEdit = (e: VariableExpense) => {
      setEditingId(e.id);
      setEditDesc(e.description);
      setEditAmount(e.amount.toString());
  };

  const saveEdit = () => {
      if (editingId && editDesc && editAmount) {
          updateVariableExpense(editingId, {
              description: editDesc,
              amount: parseFloat(editAmount)
          });
          setEditingId(null);
      }
  };

  return (
    <div className="space-y-6 pb-20">
        
        {/* 1. Date Selector */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span className="font-bold text-slate-800 dark:text-white text-lg capitalize">
                    {monthName} {currentYear}
                </span>
            </div>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
        </div>

        {/* 2. Analytics Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-end mb-4">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> 
                    {settings.language === 'es-UY' ? 'Distribución Mensual' : 'Monthly Distribution'}
                </h3>
                <span className="text-lg font-black text-slate-800 dark:text-white">
                    {formatMoney(analytics.total, settings.baseCurrency)}
                </span>
            </div>
            
            <div className="w-full h-4 bg-slate-100 dark:bg-slate-700 rounded-full flex overflow-hidden mb-3">
                {analytics.total > 0 ? (
                    <>
                        <div style={{ width: `${(analytics.vital / analytics.total) * 100}%` }} className="bg-emerald-500 h-full transition-all duration-500" />
                        <div style={{ width: `${(analytics.flexible / analytics.total) * 100}%` }} className="bg-blue-500 h-full transition-all duration-500" />
                        <div style={{ width: `${(analytics.leisure / analytics.total) * 100}%` }} className="bg-purple-500 h-full transition-all duration-500" />
                    </>
                ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700" />
                )}
            </div>
            
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>{getImportanceLabel('vital', settings.language)}</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>{getImportanceLabel('flexible', settings.language)}</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>{getImportanceLabel('leisure', settings.language)}</div>
            </div>
        </div>

        {/* 3. Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
                onClick={() => setFilterCategory('all')} 
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${filterCategory === 'all' ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white' : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
            >
                {settings.language === 'es-UY' ? 'Todas' : 'All'}
            </button>
            {(['food', 'transport', 'leisure', 'utilities'] as ExpenseCategory[]).map(cat => (
                <button 
                    key={cat}
                    onClick={() => setFilterCategory(cat)} 
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${filterCategory === cat ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white' : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
                >
                    {getCategoryLabel(cat, settings.language)}
                </button>
            ))}
        </div>

        {/* 4. Transaction List */}
        <div className="space-y-3">
            {filteredExpenses.length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-600">
                    <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                        {settings.language === 'es-UY' ? 'No hay movimientos registrados.' : 'No transactions found.'}
                    </p>
                </div>
            ) : (
                filteredExpenses.sort((a,b) => b.timestamp - a.timestamp).map(expense => (
                    <div key={expense.id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group relative overflow-hidden ${expense.isImpulsive ? 'border-l-4 border-l-red-400' : ''}`}>
                        
                        {editingId === expense.id ? (
                            // Edit Mode
                            <div className="flex-1 flex gap-2 items-center">
                                <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} autoFocus className="h-8 text-sm" />
                                <Input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="h-8 text-sm w-24" />
                                <button onClick={saveEdit} className="p-2 bg-primary-100 text-primary-600 rounded-lg"><Pencil className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                                        {getCategoryIcon(expense.category)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white capitalize text-sm">{expense.description}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${getImportanceColor(expense.importance)}`}>
                                                {getImportanceLabel(expense.importance, settings.language)}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(expense.date).toLocaleDateString(settings.language)}
                                            </span>
                                            {expense.isImpulsive && (
                                                <span className="text-[10px] text-red-500 font-bold flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-0.5" /> 
                                                    {settings.language === 'es-UY' ? 'Impulsivo' : 'Impulsive'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-800 dark:text-white">{formatMoney(expense.amount, expense.currency)}</span>
                                    
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(expense)} className="p-1.5 text-slate-300 hover:text-primary-500 transition-colors">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => removeVariableExpense(expense.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    </div>
  );
};