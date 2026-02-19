import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { SavingGoal, Currency } from '../types';
import { convertToCurrency } from '../utils/finance';
import {
    Plus,
    Trash2,
    Pencil,
    Plane,
    Car,
    Home,
    Shield,
    Gift,
    Smartphone,
    Rocket,
    PiggyBank,
    Target,
    X,
    TrendingUp,
    Zap,
    Lock,
    BrainCircuit,
    ArrowRight
} from 'lucide-react';

const ICONS: Record<string, any> = {
    'plane': Plane,
    'car': Car,
    'home': Home,
    'shield': Shield,
    'gift': Gift,
    'phone': Smartphone,
    'rocket': Rocket,
    'piggy': PiggyBank
};

export const SavingsModule: React.FC = () => {
    const { data, addSavingGoal, updateSavingGoal, removeSavingGoal, settings, addVariableExpense } = useStore();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [monthlyContribution, setMonthlyContribution] = useState('');
    const [currency, setCurrency] = useState<Currency>('UYU');
    const [icon, setIcon] = useState('piggy');
    const [color, setColor] = useState('bg-emerald-500');

    // Rescue Modal State
    const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
    const [activeRescueGoal, setActiveRescueGoal] = useState<SavingGoal | null>(null);
    const [rescueAmount, setRescueAmount] = useState('');

    const goals = data.savingGoals || [];

    // Stats
    const totalSavings = goals.reduce((acc, g) => acc + convertToCurrency(g.currentAmount, g.currency, settings.baseCurrency, data.exchangeRate), 0);
    const monthlyCommitment = goals.reduce((acc, g) => acc + convertToCurrency(g.monthlyContribution, g.currency, settings.baseCurrency, data.exchangeRate), 0);

    const formatMoney = (amount: number, curr: Currency) => {
        return new Intl.NumberFormat(settings.language, { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(amount);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
        setMonthlyContribution('');
        setIcon('piggy');
        setColor('bg-emerald-500');
    };

    const handleEdit = (goal: SavingGoal) => {
        setName(goal.name);
        setTargetAmount(goal.targetAmount.toString());
        setCurrentAmount(goal.currentAmount.toString());
        setMonthlyContribution(goal.monthlyContribution.toString());
        setCurrency(goal.currency);
        setIcon(goal.icon);
        setColor(goal.color);
        setEditingId(goal.id);
        setShowForm(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const goalData = {
            name,
            targetAmount: parseFloat(targetAmount) || 0,
            currentAmount: parseFloat(currentAmount) || 0,
            monthlyContribution: parseFloat(monthlyContribution) || 0,
            currency,
            icon,
            color
        };

        if (editingId) {
            updateSavingGoal(editingId, goalData);
        } else {
            addSavingGoal({
                id: Math.random().toString(36).substr(2, 9),
                ...goalData
            });
        }
        resetForm();
    };

    const handleRescue = (goal: SavingGoal) => {
        setActiveRescueGoal(goal);
        setRescueAmount('');
        setIsRescueModalOpen(true);
    };

    const handleConfirmRescue = () => {
        if (!activeRescueGoal || !rescueAmount) return;
        const amount = parseFloat(rescueAmount);

        if (isNaN(amount) || amount <= 0) return;
        if (amount > activeRescueGoal.currentAmount) {
            alert("No tienes suficiente dinero en este cofre.");
            return;
        }

        // 1. Subtract from goal
        updateSavingGoal(activeRescueGoal.id, {
            currentAmount: activeRescueGoal.currentAmount - amount
        });

        // 2. Inject liquidity into variable expenses as a negative expense (Income)
        const newRescueEntry = {
            id: `rescue-${Date.now()}`,
            description: `Rescate: ${activeRescueGoal.name}`,
            amount: -amount, // Negative = Income (Available goes UP)
            currency: activeRescueGoal.currency,
            category: 'utilities' as any,
            importance: 'vital' as any,
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
            isImpulsive: false
        };

        addVariableExpense(newRescueEntry);
        setIsRescueModalOpen(false);
        setActiveRescueGoal(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pb-20"
        >

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                    whileHover={{ y: -2 }}
                    className="glass glass-border p-6 rounded-[2rem] shadow-luxury"
                >
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 ml-1">Total en Cofres</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                        {formatMoney(totalSavings, settings.baseCurrency)}
                    </h3>
                </motion.div>
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-gradient-to-br from-primary-500 to-indigo-600 p-6 rounded-[2rem] shadow-luxury relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 opacity-10">
                        <TrendingUp className="w-20 h-20 text-white" />
                    </div>
                    <p className="text-primary-100 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Aporte Mensual</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter relative z-10">
                        {formatMoney(monthlyCommitment, settings.baseCurrency)}
                    </h3>
                    <p className="text-[9px] text-primary-200 mt-2 font-bold uppercase tracking-tight relative z-10">Descontado del flujo diario</p>
                </motion.div>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    {!showForm ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Button
                                variant="ghost"
                                onClick={() => { resetForm(); setShowForm(true); }}
                                className="w-full h-16 rounded-[2rem] border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-transparent text-primary-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Crear Nuevo Cofre
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleSave}
                            className="glass glass-border p-8 rounded-[2.5rem] space-y-6 shadow-luxury relative z-10"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{editingId ? 'Editar Cofre' : 'Nuevo Cofre'}</h3>
                                <button type="button" onClick={resetForm} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
                            </div>

                            <Input placeholder="Nombre del Objetivo" value={name} onChange={e => setName(e.target.value)} autoFocus />

                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Meta Final" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Moneda</label>
                                    <select
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value as Currency)}
                                        className="h-12 w-full bg-white dark:bg-slate-900 rounded-[1.25rem] px-4 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                    >
                                        <option>UYU</option><option>USD</option><option>UI</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Aportado" type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} />
                                <Input label="Aporte Mensual" type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} />
                            </div>

                            <div className="glass glass-border p-6 rounded-[1.75rem]">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Estética del Cofre</label>
                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                    <div className="flex gap-2.5">
                                        {['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'].map(c => (
                                            <button
                                                type="button"
                                                key={c}
                                                onClick={() => setColor(c)}
                                                className={`w-7 h-7 rounded-full transition-all duration-300 ${c} ${color === c ? 'ring-4 ring-offset-4 ring-slate-200 dark:ring-slate-700 scale-110' : 'opacity-60 hover:opacity-100'}`}
                                            ></button>
                                        ))}
                                    </div>
                                    <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="flex gap-2">
                                        {Object.keys(ICONS).map(k => {
                                            const IconC = ICONS[k];
                                            return (
                                                <button type="button" key={k} onClick={() => setIcon(k)} className={`p-2.5 rounded-xl transition-all ${icon === k ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                                    <IconC className="w-5 h-5" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 rounded-[1.25rem] font-black text-xs uppercase tracking-widest">
                                {editingId ? 'Actualizar Cofre' : 'Crear Cofre'}
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    {goals.length === 0 && !showForm && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                            <PiggyBank className="w-20 h-20 mb-4 opacity-10" />
                            <p className="text-xs font-black uppercase tracking-widest opacity-40">Bóveda vacía (Sin Cofres)</p>
                        </div>
                    )}
                    {goals.map(goal => {
                        const Icon = ICONS[goal.icon] || PiggyBank;
                        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

                        const remaining = goal.targetAmount - goal.currentAmount;
                        const monthsLeft = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;

                        return (
                            <motion.div
                                layout
                                key={goal.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass glass-border p-8 rounded-[2.5rem] shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-all group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-16 h-16 rounded-3xl ${goal.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
                                            <div className={`absolute inset-0 ${goal.color} opacity-20 blur-xl`}></div>
                                            <Icon className={`w-8 h-8 ${goal.color.replace('bg-', 'text-')} relative z-10 animate-pulse`} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xl text-slate-800 dark:text-white tracking-tight leading-none mb-2">{goal.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta</span>
                                                <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">{formatMoney(goal.targetAmount, goal.currency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-black text-slate-800 dark:text-white tracking-tighter mb-1">{formatMoney(goal.currentAmount, goal.currency)}</span>
                                        {monthsLeft !== null && remaining > 0 ? (
                                            <div className="flex items-center justify-end gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                                                <Target className="w-3 h-3 text-primary-500" /> {monthsLeft} meses
                                            </div>
                                        ) : remaining <= 0 && (
                                            <div className="flex items-center justify-end gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/10 text-[9px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/20">
                                                <Shield className="w-3 h-3" /> Completado
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar Container */}
                                <div className="space-y-3 mb-6 relative z-10">
                                    <div className="w-full bg-slate-100 dark:bg-slate-900/50 rounded-full h-3 overflow-hidden p-0.5 border border-slate-50 dark:border-slate-800">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, progress)}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={`h-full rounded-full ${goal.color} shadow-lg shadow-current opacity-80`}
                                        ></motion.div>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{progress.toFixed(0)}% Alcanzado</span>
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">Aporte: {formatMoney(goal.monthlyContribution, goal.currency)} /mes</span>
                                    </div>
                                </div>

                                {/* Actions bar */}
                                <div className="flex justify-end gap-2 relative z-10">
                                    <button
                                        onClick={() => handleRescue(goal)}
                                        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-900/20"
                                    >
                                        <Zap className="w-4 h-4" /> Rescatar
                                    </button>
                                    <button onClick={() => handleEdit(goal)} className="p-3 rounded-2xl text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeSavingGoal(goal.id)} className="p-3 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Premium Rescue Modal */}
            <AnimatePresence>
                {isRescueModalOpen && activeRescueGoal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 p-8"
                        >
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                    <BrainCircuit className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Rescate de Emergencia</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-black">
                                    Cofre: {activeRescueGoal.name}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Monto a Rescatar</label>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-black text-slate-400">{activeRescueGoal.currency}</span>
                                        <input
                                            type="number"
                                            autoFocus
                                            value={rescueAmount}
                                            onChange={e => setRescueAmount(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-transparent text-3xl font-black text-slate-800 dark:text-white outline-none"
                                        />
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disponible en Cofre</span>
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">{formatMoney(activeRescueGoal.currentAmount, activeRescueGoal.currency)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsRescueModalOpen(false)}
                                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmRescue}
                                        disabled={!rescueAmount || parseFloat(rescueAmount) <= 0}
                                        className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        Inyectar Liquidez <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};