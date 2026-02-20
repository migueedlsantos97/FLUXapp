import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
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
    Pencil,
    TrendingUp,
    Plus,
    X,
    Check
} from 'lucide-react';
import { PulseModule } from './PulseModule';

interface BudgetModuleProps {
    pulseData: any;
    dayZero: any;
    formatMoneyProp: (amount: number) => string;
    daysInMonth: number;
    currentDay: number;
}

export const BudgetModule: React.FC<BudgetModuleProps> = ({ pulseData, dayZero, formatMoneyProp, daysInMonth, currentDay }) => {
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

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            housing: 'Vivienda',
            utilities: 'Servicios',
            loans: 'Préstamos',
            subscription: 'Suscripción',
            education: 'Educación',
            food: 'Alimentación',
            transport: 'Transporte',
            leisure: 'Ocio',
            health: 'Salud',
            other: 'Otro'
        };
        return labels[category] || category;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pb-20"
        >

            {/* 1. TOP METRICS & EXCHANGE RATE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hourly Rate Widget */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-surface rounded-[2rem] p-6 text-main border border-main shadow-luxury relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Briefcase className="w-16 h-16" />
                    </div>
                    <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">Tu Valor Hora</p>
                    <h3 className="text-3xl font-black tracking-tighter text-sentry-liberate">{formatMoney(data.hourlyRate)}</h3>
                    <p className="text-[10px] text-muted mt-2 font-medium opacity-80">Ingreso Neto / Horas Reales</p>
                </motion.div>

                {/* Exchange Rate Input */}
                <div className="glass glass-border rounded-[2rem] p-6 shadow-luxury flex flex-col justify-center">
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 ml-1">Cotización (Buffer)</label>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500">USD</div>
                        <input
                            type="number"
                            value={data.exchangeRate}
                            onChange={(e) => updateData({ exchangeRate: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-transparent text-2xl font-black text-slate-800 dark:text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* 2. SEQUESTRATION ACCORDION (The "Safe Box") */}
            <div className="glass glass-border rounded-[2.5rem] shadow-luxury overflow-hidden">
                <button
                    onClick={() => setShowSequestrationDetails(!showSequestrationDetails)}
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${sequestration.pending > 0 ? 'bg-sentry-observe/10 text-sentry-observe' : 'bg-sentry-liberate/10 text-sentry-liberate'}`}>
                            <Lock className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Caja Fuerte (Retenido)</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
                                {formatMoney(sequestration.pending)}
                            </p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: showSequestrationDetails ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronDown className="w-6 h-6 text-slate-300" />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {showSequestrationDetails && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                    <span className="text-slate-400">Total Comprometido:</span>
                                    <span className="text-slate-600 dark:text-slate-200">{formatMoney(sequestration.total)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                    <span className="text-slate-400">Ya Pagado:</span>
                                    <span className="text-emerald-600">-{formatMoney(sequestration.paid)}</span>
                                </div>

                                {/* Detailed Breakdown */}
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Desglose de Fondos Retenidos</h4>
                                    <div className="space-y-3">
                                        {data.fixedExpenses.filter(e => !e.isPaid).length === 0 ? (
                                            <p className="text-xs text-muted italic text-center py-4 bg-surface rounded-2xl border border-dashed border-main">No hay fondos retenidos actualmente.</p>
                                        ) : (
                                            data.fixedExpenses.filter(e => !e.isPaid).map(exp => {
                                                const convertedAmount = convertToCurrency(exp.amount, exp.currency, settings.baseCurrency, data.exchangeRate);
                                                return (
                                                    <div key={exp.id} className="glass glass-border p-4 rounded-2xl flex justify-between items-center shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${exp.priority === 'vital' ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{exp.name}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm font-black text-slate-800 dark:text-white">
                                                                {formatMoney(convertedAmount)}
                                                            </span>
                                                            {exp.currency !== settings.baseCurrency && (
                                                                <span className="text-[9px] font-bold text-slate-400 block uppercase">
                                                                    {exp.currency} {exp.amount}
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
                                    <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-3xl border border-red-100 dark:border-red-900/30 text-xs">
                                        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                        <p className="font-semibold leading-relaxed">Alerta: Tus gastos fijos consumen más del 80% de tus ingresos. Esto reduce drásticamente tu capacidad de maniobra diaria.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 2.5 WARDEN PULSE INTEGRATION */}
            <div className="mb-8 overflow-hidden">
                <PulseModule
                    data={pulseData}
                    daysInMonth={daysInMonth}
                    currentDay={currentDay}
                    formatMoney={formatMoneyProp}
                    dayZero={dayZero}
                />
            </div>

            {/* 3. TABS & LISTS */}
            <div>
                <div className="flex p-1.5 bg-surface-alt border border-main rounded-2xl mb-6 shadow-xl">
                    <button
                        onClick={() => { setActiveTab('incomes'); closeForms(); }}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'incomes' ? 'bg-main text-background' : 'text-muted hover:text-main'}`}
                    >
                        Ingresos
                    </button>
                    <button
                        onClick={() => { setActiveTab('expenses'); closeForms(); }}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'expenses' ? 'bg-main text-background' : 'text-muted hover:text-main'}`}
                    >
                        Gastos Fijos
                    </button>
                </div>

                {/* INCOMES TAB */}
                {activeTab === 'incomes' && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="incomes"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {!showForms ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => { setEditingId(null); setShowForms(true); }}
                                    className="w-full h-16 rounded-3xl border-dashed border-2 border-main bg-white/5 text-muted hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Registrar Nuevo Ingreso
                                </Button>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onSubmit={handleSaveIncome}
                                    className="bg-surface border border-main p-6 rounded-[2.5rem] space-y-4 shadow-2xl relative z-10"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            {editingId ? 'Editar Ingreso' : 'Nuevo Ingreso'}
                                        </h3>
                                        <button type="button" onClick={closeForms} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4 text-slate-400" /></button>
                                    </div>
                                    <Input placeholder="Nombre (ej. Sueldo)" value={incName} onChange={e => setIncName(e.target.value)} autoFocus />
                                    <div className="flex gap-2">
                                        <Input type="number" placeholder="Monto" value={incAmount} onChange={e => setIncAmount(e.target.value)} />
                                        <Select
                                            value={incCurrency}
                                            onChange={val => setIncCurrency(val as Currency)}
                                            options={[
                                                { value: 'UYU', label: 'UYU' },
                                                { value: 'USD', label: 'USD' }
                                            ]}
                                            className="w-28"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select
                                            value={incType}
                                            onChange={val => setIncType(val as IncomeType)}
                                            options={[
                                                { value: 'fixed_date', label: 'Día Fijo (Mes)' },
                                                { value: 'business_day', label: 'Día Hábil' }
                                            ]}
                                            className="flex-1"
                                        />
                                        <Input type="number" placeholder="Día" value={incDay} onChange={e => setIncDay(e.target.value)} className="w-24" />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button type="submit" className="flex-1 h-12 rounded-[1.25rem]">{editingId ? 'Actualizar' : 'Guardar'}</Button>
                                    </div>
                                </motion.form>
                            )}

                            <div className="space-y-3">
                                {data.incomes.length === 0 && !showForms && (
                                    <p className="text-center py-10 text-slate-400 font-medium italic">No has registrado ningún ingreso todavía.</p>
                                )}
                                {data.incomes.map(inc => {
                                    const nextPayday = calculatePayday(inc.dayValue, inc.type, allHolidays);
                                    const isToday = nextPayday.toDateString() === new Date().toDateString();

                                    return (
                                        <motion.div
                                            layout
                                            key={inc.id}
                                            className="bg-surface-alt border border-main p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center group hover:bg-white/5 transition-all border-l-4 border-l-sentry-liberate"
                                        >
                                            <div className="cursor-pointer flex-1" onClick={() => handleEditIncome(inc)}>
                                                <h4 className="font-black text-slate-800 dark:text-white tracking-tight">{inc.name}</h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <div className={`px-2 py-0.5 rounded-lg text-[9px] uppercase font-black tracking-widest ${isToday ? 'bg-sentry-liberate/10 text-sentry-liberate' : 'bg-background text-muted'}`}>
                                                        {inc.type === 'business_day' ? `${inc.dayValue}º Día Hábil` : `Día ${inc.dayValue}`}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-muted uppercase tracking-tight">Cobro: {nextPayday.toLocaleDateString(settings.language, { day: 'numeric', month: 'short', weekday: 'short' })}</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                <div className="hidden sm:block">
                                                    <p className="font-black text-main tracking-tighter">{inc.currency} {inc.amount}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => removeIncome(inc.id)} className="p-2.5 rounded-xl text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* EXPENSES TAB */}
                {activeTab === 'expenses' && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="expenses"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {!showForms ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => { setEditingId(null); setShowForms(true); }}
                                    className="w-full h-16 rounded-3xl border-dashed border-2 border-main bg-white/5 text-muted hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agendar Gasto Fijo
                                </Button>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onSubmit={handleSaveExpense}
                                    className="bg-surface border border-main p-6 rounded-[2.5rem] space-y-4 shadow-2xl relative z-10"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            {editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
                                        </h3>
                                        <button type="button" onClick={closeForms} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4 text-slate-400" /></button>
                                    </div>
                                    <Input placeholder="Concepto (ej. Alquiler)" value={expName} onChange={e => setExpName(e.target.value)} autoFocus />
                                    <div className="flex gap-2">
                                        <Input type="number" placeholder="Monto" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
                                        <Select
                                            value={expCurrency}
                                            onChange={val => setExpCurrency(val as Currency)}
                                            options={[
                                                { value: 'UYU', label: 'UYU' },
                                                { value: 'USD', label: 'USD' }
                                            ]}
                                            className="w-28"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select
                                            value={expCategory}
                                            onChange={val => setExpCategory(val as ExpenseCategory)}
                                            options={[
                                                { value: 'housing', label: 'Vivienda' },
                                                { value: 'utilities', label: 'Servicios' },
                                                { value: 'loans', label: 'Deudas' },
                                                { value: 'subscription', label: 'Suscripción' },
                                                { value: 'food', label: 'Alimentación' },
                                                { value: 'education', label: 'Educación' },
                                                { value: 'health', label: 'Salud' },
                                                { value: 'other', label: 'Otros' }
                                            ]}
                                            className="flex-1"
                                        />
                                        <Select
                                            value={expPriority}
                                            onChange={val => setExpPriority(val as ExpensePriority)}
                                            options={[
                                                { value: 'vital', label: 'Vital (N1)' },
                                                { value: 'subscription', label: 'Opcional (N2)' }
                                            ]}
                                            className="flex-1"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vence el día:</span>
                                        <Input type="number" placeholder="1-31" value={expDay} onChange={e => setExpDay(e.target.value)} className="w-24" />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button type="submit" className="flex-1 h-12 rounded-[1.25rem]">{editingId ? 'Actualizar' : 'Guardar'}</Button>
                                    </div>
                                </motion.form>
                            )}

                            <div className="space-y-3">
                                {data.fixedExpenses.length === 0 && !showForms && (
                                    <p className="text-center py-10 text-slate-400 font-medium italic">No has agendado gastos fijos todavía.</p>
                                )}
                                {data.fixedExpenses.map(exp => (
                                    <motion.div
                                        layout
                                        key={exp.id}
                                        className={`relative bg-surface-alt border border-main p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center transition-all group overflow-hidden ${exp.isPaid ? 'opacity-50 grayscale' : ''}`}
                                    >
                                        {/* Priority Indicator Strip */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${exp.priority === 'vital' ? 'bg-sentry-active' : 'bg-sentry-observe'}`}></div>

                                        <div className="flex items-center gap-4 pl-2 flex-1 cursor-pointer" onClick={() => handleEditExpense(exp)}>
                                            <button onClick={(e) => { e.stopPropagation(); toggleExpensePaid(exp.id); }} className="focus:outline-none transition-transform hover:scale-110">
                                                {exp.isPaid
                                                    ? <CheckCircle2 className="w-7 h-7 text-sentry-liberate" />
                                                    : <Circle className="w-7 h-7 text-muted hover:text-main" />
                                                }
                                            </button>
                                            <div>
                                                <h4 className={`font-black tracking-tight ${exp.isPaid ? 'text-muted line-through' : 'text-main'}`}>{exp.name}</h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        {exp.priority === 'vital' ? <Zap className="w-3 h-3 text-sentry-active" /> : <Coffee className="w-3 h-3 text-sentry-observe" />}
                                                        <span className="text-[9px] font-black text-muted uppercase tracking-widest">{getCategoryLabel(exp.category)}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-muted uppercase tracking-tight">Vence el {exp.dueDate}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex items-center gap-4">
                                            <div className="hidden sm:block">
                                                <p className="font-black text-main tracking-tighter">{exp.currency} {exp.amount}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => removeFixedExpense(exp.id)} className="p-2.5 rounded-xl text-muted hover:text-sentry-active hover:bg-sentry-active/10 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div >
                        </motion.div >
                    </AnimatePresence >
                )}
            </div >

        </motion.div >
    );
};