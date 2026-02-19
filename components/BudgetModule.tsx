import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Income, FixedExpense, Currency, ExpenseCategory, IncomeType, ExpensePriority } from '../types';
import { calculatePayday, calculateTotalIncome, calculateSequestration, convertToCurrency } from '../utils/finance';
import { getHolidays } from '../utils/holidays';
import { 
    Trash2, 
    ShieldAlert, 
    CheckCircle2, 
    Circle, 
    ChevronDown, 
    ChevronUp,
    Lock,
    Zap,
    Coffee,
    Briefcase,
    Pencil
} from 'lucide-react';

export const BudgetModule: React.FC = () => {
  const { 
      data, settings, updateData,
      addIncome, updateIncome, removeIncome, 
      addFixedExpense, updateFixedExpense, removeFixedExpense, toggleExpensePaid 
  } = useStore();
  
  // UI View State
  const [activeTab, setActiveTab] = useState<'incomes' | 'expenses'>('incomes');
  const [showSequestrationDetails, setShowSequestrationDetails] = useState(false);
  const [showForms, setShowForms] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Forms State
  const [incName, setIncName] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incCurrency, setIncCurrency] = useState<Currency>('UYU');
  const [incType, setIncType] = useState<IncomeType>('fixed_date');
  const [incDay, setIncDay] = useState('');

  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCurrency, setExpCurrency] = useState<Currency>('UYU');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('utilities');
  const [expPriority, setExpPriority] = useState<ExpensePriority>('vital');
  const [expDay, setExpDay] = useState('');

  // Calculations
  const allHolidays = getHolidays(settings.customHolidays);
  const totalIncome = calculateTotalIncome(data.incomes, settings.baseCurrency, data.exchangeRate);
  const sequestration = calculateSequestration(data.fixedExpenses, settings.baseCurrency, data.exchangeRate);
  
  // --- Income Logic ---

  const handleEditIncome = (inc: Income) => {
    setIncName(inc.name);
    setIncAmount(inc.amount.toString());
    setIncCurrency(inc.currency);
    setIncType(inc.type);
    setIncDay(inc.dayValue.toString());
    
    setEditingId(inc.id);
    setShowForms(true);
  };

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incName || !incAmount || !incDay) return;
    
    if (editingId) {
        updateIncome(editingId, {
            name: incName,
            amount: parseFloat(incAmount),
            currency: incCurrency,
            type: incType,
            dayValue: parseInt(incDay)
        });
    } else {
        const newIncome: Income = {
            id: Math.random().toString(36).substr(2, 9),
            name: incName,
            amount: parseFloat(incAmount),
            currency: incCurrency,
            type: incType,
            dayValue: parseInt(incDay)
        };
        addIncome(newIncome);
    }
    
    closeForms();
  };

  // --- Expense Logic ---

  const handleEditExpense = (exp: FixedExpense) => {
    setExpName(exp.name);
    setExpAmount(exp.amount.toString());
    setExpCurrency(exp.currency);
    setExpCategory(exp.category);
    setExpPriority(exp.priority);
    setExpDay(exp.dueDate.toString());

    setEditingId(exp.id);
    setShowForms(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName || !expAmount || !expDay) return;

    if (editingId) {
        updateFixedExpense(editingId, {
            name: expName,
            amount: parseFloat(expAmount),
            currency: expCurrency,
            category: expCategory,
            priority: expPriority,
            dueDate: parseInt(expDay)
        });
    } else {
        const newExpense: FixedExpense = {
            id: Math.random().toString(36).substr(2, 9),
            name: expName,
            amount: parseFloat(expAmount),
            currency: expCurrency,
            category: expCategory,
            priority: expPriority,
            dueDate: parseInt(expDay),
            isPaid: false
        };
        addFixedExpense(newExpense);
    }
    
    closeForms();
  };

  const closeForms = () => {
    setShowForms(false);
    setEditingId(null);
    setIncName(''); setIncAmount(''); setIncDay('');
    setExpName(''); setExpAmount(''); setExpDay('');
  };

  // --- Render Helpers ---

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-UY', { 
        style: 'currency', 
        currency: settings.baseCurrency,
        maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. TOP METRICS & EXCHANGE RATE */}
      <div className="grid grid-cols-2 gap-4">
        {/* Hourly Rate Widget */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Briefcase className="w-12 h-12" />
            </div>
            <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-1">Tu Valor Hora</p>
            <h3 className="text-2xl font-bold">{formatMoney(data.hourlyRate)}</h3>
            <p className="text-[10px] text-indigo-200 mt-1">Ingreso Neto / Horas Reales</p>
        </div>

        {/* Exchange Rate Input */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
             <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Cotización (Buffer)</label>
             <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">USD</span>
                <input 
                    type="number" 
                    value={data.exchangeRate}
                    onChange={(e) => updateData({ exchangeRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1 text-right font-mono text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
             </div>
        </div>
      </div>

      {/* 2. SEQUESTRATION ACCORDION (The "Safe Box") */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button 
            onClick={() => setShowSequestrationDetails(!showSequestrationDetails)}
            className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${sequestration.pending > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <Lock className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Caja Fuerte (Retenido)</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                        {formatMoney(sequestration.pending)}
                    </p>
                </div>
            </div>
            {showSequestrationDetails ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showSequestrationDetails && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Total Comprometido:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{formatMoney(sequestration.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Ya Pagado:</span>
                        <span className="font-medium text-green-600">-{formatMoney(sequestration.paid)}</span>
                    </div>
                    
                    {/* Detailed Breakdown */}
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Conceptos Retenidos</h4>
                        <div className="space-y-2">
                            {data.fixedExpenses.filter(e => !e.isPaid).length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No hay fondos retenidos actualmente.</p>
                            ) : (
                                data.fixedExpenses.filter(e => !e.isPaid).map(exp => {
                                    const convertedAmount = convertToCurrency(exp.amount, exp.currency, settings.baseCurrency, data.exchangeRate);
                                    return (
                                        <div key={exp.id} className="flex justify-between items-center text-sm group">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${exp.priority === 'vital' ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                                                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[160px]">{exp.name}</span>
                                            </div>
                                            <div className="text-right">
                                                 <span className="font-bold text-slate-800 dark:text-white block">
                                                    {formatMoney(convertedAmount)}
                                                 </span>
                                                 {exp.currency !== settings.baseCurrency && (
                                                     <span className="text-[10px] text-slate-400 block">
                                                        ({exp.currency} {exp.amount})
                                                     </span>
                                                 )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Priority Warning */}
                    {sequestration.pending > totalIncome * 0.8 && (
                        <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-xs mt-3">
                            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>Alerta: Tus gastos fijos consumen más del 80% de tus ingresos. Considera pausar suscripciones de Nivel 2.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* 3. TABS & LISTS */}
      <div>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
            <button 
                onClick={() => { setActiveTab('incomes'); closeForms(); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'incomes' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
                Ingresos
            </button>
            <button 
                onClick={() => { setActiveTab('expenses'); closeForms(); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'expenses' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
                Gastos Fijos
            </button>
        </div>

        {/* INCOMES TAB */}
        {activeTab === 'incomes' && (
            <div className="space-y-4 animate-fade-in">
                {!showForms ? (
                    <Button 
                        variant="ghost" 
                        onClick={() => { setEditingId(null); setShowForms(true); }} 
                        className="w-full border-dashed border-2 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-transparent text-primary-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-800 hover:border-primary-300 dark:hover:border-slate-600 transition-all font-semibold"
                    >
                        + Registrar Nuevo Ingreso
                    </Button>
                ) : (
                    <form onSubmit={handleSaveIncome} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-sm font-bold text-slate-700 dark:text-white">
                                 {editingId ? 'Editar Ingreso' : 'Nuevo Ingreso'}
                             </h3>
                        </div>
                        <Input placeholder="Nombre (ej. Sueldo)" value={incName} onChange={e => setIncName(e.target.value)} autoFocus />
                        <div className="flex gap-2">
                            <Input type="number" placeholder="Monto" value={incAmount} onChange={e => setIncAmount(e.target.value)} />
                            <select 
                                value={incCurrency} 
                                onChange={e => setIncCurrency(e.target.value as Currency)} 
                                className="bg-white dark:bg-slate-800 rounded-lg px-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option>UYU</option><option>USD</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <select 
                                value={incType} 
                                onChange={e => setIncType(e.target.value as IncomeType)} 
                                className="flex-1 bg-white dark:bg-slate-800 rounded-lg px-2 border border-slate-200 dark:border-slate-700 h-10 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="fixed_date">Día Fijo (Mes)</option>
                                <option value="business_day">Día Hábil</option>
                            </select>
                            <Input type="number" placeholder="Día" value={incDay} onChange={e => setIncDay(e.target.value)} className="w-20" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={closeForms} className="flex-1">Cancelar</Button>
                            <Button type="submit" className="flex-1">{editingId ? 'Actualizar' : 'Guardar'}</Button>
                        </div>
                    </form>
                )}

                {data.incomes.map(inc => {
                    const nextPayday = calculatePayday(inc.dayValue, inc.type, allHolidays);
                    const isToday = nextPayday.toDateString() === new Date().toDateString();
                    
                    return (
                        <div key={inc.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-l-emerald-500 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center group hover:shadow-md transition-shadow">
                            <div className="cursor-pointer flex-1" onClick={() => handleEditIncome(inc)}>
                                <h4 className="font-bold text-slate-800 dark:text-white">{inc.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${isToday ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                        {inc.type === 'business_day' ? `${inc.dayValue}º Día Hábil` : `Día ${inc.dayValue}`}
                                    </div>
                                    <span className="text-xs text-slate-400">Cobro: {nextPayday.toLocaleDateString(settings.language, { day: 'numeric', month: 'short', weekday: 'short' })}</span>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                                <div className="hidden sm:block">
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{inc.currency} {inc.amount}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditIncome(inc)} className="p-2 text-slate-300 hover:text-primary-500 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeIncome(inc.id)} className="p-2 text-slate-300 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
            <div className="space-y-4 animate-fade-in">
                 {!showForms ? (
                    <Button 
                        variant="ghost"
                        onClick={() => { setEditingId(null); setShowForms(true); }}
                        className="w-full border-dashed border-2 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-transparent text-primary-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-800 hover:border-primary-300 dark:hover:border-slate-600 transition-all font-semibold"
                    >
                        + Agendar Gasto Fijo
                    </Button>
                ) : (
                    <form onSubmit={handleSaveExpense} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-sm font-bold text-slate-700 dark:text-white">
                                 {editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
                             </h3>
                        </div>
                        <Input placeholder="Concepto (ej. Alquiler)" value={expName} onChange={e => setExpName(e.target.value)} autoFocus />
                        <div className="flex gap-2">
                            <Input type="number" placeholder="Monto" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
                            <select 
                                value={expCurrency} 
                                onChange={e => setExpCurrency(e.target.value as Currency)} 
                                className="bg-white dark:bg-slate-800 rounded-lg px-2 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option>UYU</option><option>USD</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                             <select 
                                value={expCategory} 
                                onChange={e => setExpCategory(e.target.value as ExpenseCategory)} 
                                className="flex-1 bg-white dark:bg-slate-800 rounded-lg px-2 border border-slate-200 dark:border-slate-700 h-10 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                             >
                                <option value="housing">Vivienda</option>
                                <option value="utilities">Servicios</option>
                                <option value="loans">Deudas</option>
                                <option value="subscription">Suscripción</option>
                            </select>
                             <select 
                                value={expPriority} 
                                onChange={e => setExpPriority(e.target.value as ExpensePriority)} 
                                className="flex-1 bg-white dark:bg-slate-800 rounded-lg px-2 border border-slate-200 dark:border-slate-700 h-10 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                             >
                                <option value="vital">Vital (N1)</option>
                                <option value="subscription">Opcional (N2)</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Vence el día:</span>
                            <Input type="number" placeholder="1-31" value={expDay} onChange={e => setExpDay(e.target.value)} className="w-20" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={closeForms} className="flex-1">Cancelar</Button>
                            <Button type="submit" className="flex-1">{editingId ? 'Actualizar' : 'Guardar'}</Button>
                        </div>
                    </form>
                )}

                {data.fixedExpenses.map(exp => (
                    <div 
                        key={exp.id} 
                        className={`relative bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm flex justify-between items-center transition-all group hover:shadow-md ${
                            exp.isPaid ? 'opacity-60 border-slate-100 dark:border-slate-700' : 'border-slate-200 dark:border-slate-600'
                        }`}
                    >
                        {/* Priority Indicator Strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${exp.priority === 'vital' ? 'bg-red-500' : 'bg-orange-400'}`}></div>

                        <div className="flex items-center gap-3 pl-2 flex-1 cursor-pointer" onClick={() => handleEditExpense(exp)}>
                            <button onClick={(e) => { e.stopPropagation(); toggleExpensePaid(exp.id); }} className="focus:outline-none">
                                {exp.isPaid 
                                    ? <CheckCircle2 className="w-6 h-6 text-green-500" /> 
                                    : <Circle className="w-6 h-6 text-slate-300 hover:text-primary-500" />
                                }
                            </button>
                            <div>
                                <h4 className={`font-bold ${exp.isPaid ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>{exp.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    {exp.priority === 'vital' ? <Zap className="w-3 h-3 text-red-500" /> : <Coffee className="w-3 h-3 text-orange-400" />}
                                    <span>Vence el {exp.dueDate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right flex items-center gap-3">
                             <div className="hidden sm:block">
                                <p className="font-bold text-slate-700 dark:text-slate-300">{exp.currency} {exp.amount}</p>
                             </div>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditExpense(exp)} className="p-2 text-slate-300 hover:text-primary-500 transition-colors">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => removeFixedExpense(exp.id)} className="p-2 text-slate-300 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};