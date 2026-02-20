import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { VariableExpense, ExpenseCategory, ExpenseImportance, Currency } from '../types';
import { convertToCurrency, getCategoryLabel, getImportanceLabel, formatDateLabel } from '../utils/finance';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import {
    Utensils, Bus, ShoppingBag, Zap as ZapIcon, MoreHorizontal,
    Trash2, Pencil, Filter, TrendingUp, AlertCircle, HeartPulse, Search,
    ChevronLeft, ChevronRight, Calendar, X, Check, ArrowRight
} from 'lucide-react';
import { PulseModule } from './PulseModule';

interface TransactionsModuleProps {
    pulseData: any;
    dayZero: any;
    formatMoneyProp: (amount: number) => string;
}

export const TransactionsModule: React.FC<TransactionsModuleProps> = ({ pulseData, dayZero, formatMoneyProp }) => {
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

    const expensesInMonth = allExpenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

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
        switch (cat) {
            case 'food': return <Utensils className="w-5 h-5 text-orange-500" />;
            case 'transport': return <Bus className="w-5 h-5 text-blue-500" />;
            case 'leisure': return <ShoppingBag className="w-5 h-5 text-purple-500" />;
            case 'utilities': return <ZapIcon className="w-5 h-5 text-yellow-500" />;
            case 'health': return <HeartPulse className="w-5 h-5 text-red-500" />;
            default: return <MoreHorizontal className="w-5 h-5 text-slate-400" />;
        }
    };

    const getImportanceStyles = (imp: ExpenseImportance) => {
        switch (imp) {
            case 'vital': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20';
            case 'flexible': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400 border-blue-100 dark:border-blue-900/20';
            case 'leisure': return 'bg-purple-50 text-purple-600 dark:bg-purple-900/10 dark:text-purple-400 border-purple-100 dark:border-purple-900/20';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
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
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pb-20"
        >

            {/* 1. Date Selector Premium */}
            <div className="flex items-center justify-between glass glass-border p-3 rounded-[2rem] shadow-luxury">
                <button onClick={prevMonth} className="p-3 rounded-2xl hover:bg-white/5 transition-all text-muted hover:text-main">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{currentYear}</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white capitalize tracking-tighter">
                        {monthName}
                    </span>
                </div>
                <button onClick={nextMonth} className="p-3 rounded-2xl hover:bg-white/5 transition-all text-muted hover:text-main">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Warden Pulse Visualization - Moved here to declutter Dashboard */}
            <PulseModule
                data={pulseData}
                daysInMonth={new Date(currentYear, currentMonth + 1, 0).getDate()}
                currentDay={new Date().getMonth() === currentMonth ? new Date().getDate() : (new Date() > currentDate ? new Date(currentYear, currentMonth + 1, 0).getDate() : 1)}
                formatMoney={formatMoneyProp}
                dayZero={dayZero}
            />

            {/* 2. Analytics Bar Premium */}
            <div className="glass glass-border rounded-[2.5rem] p-8 shadow-luxury">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary-500" />
                            Distribución de Gastos
                        </h3>
                        <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                            {formatMoney(analytics.total, settings.baseCurrency)}
                        </p>
                    </div>
                </div>

                <div className="w-full h-4 bg-slate-100 dark:bg-slate-900/50 rounded-full flex overflow-hidden mb-6 p-0.5 border border-slate-50 dark:border-slate-800 shadow-inner">
                    {analytics.total > 0 ? (
                        <>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(analytics.vital / analytics.total) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-emerald-500 h-full rounded-l-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(analytics.flexible / analytics.total) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                                className="bg-blue-500 h-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(analytics.leisure / analytics.total) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                className="bg-purple-500 h-full rounded-r-full shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            />
                        </>
                    ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 opacity-50" />
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-surface glass-border">
                        <div className="w-2 h-2 rounded-full bg-sentry-liberate mb-2 shadow-[0_0_8px_rgba(52,199,89,0.5)]"></div>
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest">{getImportanceLabel('vital', settings.language)}</span>
                        <span className="text-xs font-black text-main mt-1">{((analytics.vital / (analytics.total || 1)) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-surface glass-border">
                        <div className="w-2 h-2 rounded-full bg-sentry-observe mb-2 shadow-[0_0_8px_rgba(255,149,0,0.5)]"></div>
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest">{getImportanceLabel('flexible', settings.language)}</span>
                        <span className="text-xs font-black text-main mt-1">{((analytics.flexible / (analytics.total || 1)) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-surface glass-border">
                        <div className="w-2 h-2 rounded-full bg-sentry-active mb-2 shadow-[0_0_8px_rgba(255,59,48,0.5)]"></div>
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest">{getImportanceLabel('leisure', settings.language)}</span>
                        <span className="text-xs font-black text-main mt-1">{((analytics.leisure / (analytics.total || 1)) * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* 3. Filters Premium */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-1">
                <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all glass glass-border ${filterCategory === 'all' ? 'bg-primary-600 text-white shadow-luxury scale-105' : 'text-slate-500'}`}
                >
                    {settings.language === 'es-UY' ? 'Todas' : 'All'}
                </button>
                {(['food', 'transport', 'leisure', 'utilities', 'health'] as ExpenseCategory[]).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all glass glass-border whitespace-nowrap ${filterCategory === cat ? 'bg-primary-600 text-white shadow-luxury scale-105' : 'text-slate-500'}`}
                    >
                        {getCategoryLabel(cat, settings.language)}
                    </button>
                ))}
            </div>

            {/* 4. Transaction List Premium */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredExpenses.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 text-slate-300"
                        >
                            <Search className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p className="text-xs font-black uppercase tracking-widest opacity-40">
                                No hay movimientos registrados
                            </p>
                        </motion.div>
                    ) : (
                        filteredExpenses.sort((a, b) => b.timestamp - a.timestamp).map(expense => (
                            <motion.div
                                layout
                                key={expense.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`glass glass-border p-3 sm:p-5 rounded-[2rem] shadow-sm flex flex-row justify-between items-center group relative overflow-hidden transition-all hover:bg-white/5 ${expense.isImpulsive ? 'border-l-4 border-l-sentry-active bg-sentry-active/5' : ''}`}
                            >

                                {editingId === expense.id ? (
                                    // Edit Mode
                                    <div className="w-full space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editar Movimiento</h4>
                                            <button onClick={() => setEditingId(null)}><X className="w-4 h-4 text-slate-400" /></button>
                                        </div>
                                        <div className="flex gap-3">
                                            <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} autoFocus className="flex-1" />
                                            <Input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-32" />
                                            <button
                                                onClick={saveEdit}
                                                className="p-3 bg-primary-600 text-white rounded-2xl shadow-luxury"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-surface glass-border flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500 flex-shrink-0">
                                                {getCategoryIcon(expense.category)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-black text-base sm:text-lg text-slate-800 dark:text-white tracking-tight leading-none mb-1 sm:mb-2 truncate max-w-[120px] sm:max-w-none">{expense.description}</p>
                                                <div className="flex flex-row items-center gap-2 overflow-hidden whitespace-nowrap">
                                                    <div className={`px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest flex-shrink-0 ${getImportanceStyles(expense.importance)}`}>
                                                        {getImportanceLabel(expense.importance, settings.language)}
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1 flex-shrink-0">
                                                        <Calendar className="w-2.5 h-2.5" />
                                                        {formatDateLabel(expense.date, settings.language)}
                                                    </span>
                                                    {expense.isImpulsive && (
                                                        <div className="px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse flex-shrink-0">
                                                            <AlertCircle className="w-2.5 h-2.5" />
                                                            !
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-shrink-0">
                                            <div className="text-right">
                                                <p className="font-black text-lg sm:text-2xl text-slate-800 dark:text-white tracking-tighter leading-none">{formatMoney(expense.amount, expense.currency)}</p>
                                                {expense.currency !== settings.baseCurrency && (
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap mt-1">~ {formatMoney(convertToCurrency(expense.amount, expense.currency, settings.baseCurrency, data.exchangeRate), settings.baseCurrency)}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(expense)} className="p-3 rounded-2xl text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => removeVariableExpense(expense.id)} className="p-3 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};