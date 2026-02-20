import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImportCenter } from './ImportCenter';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Button } from './ui/Button';
import { BudgetModule } from './BudgetModule';
import { DebtModule } from './DebtModule';
import { TransactionsModule } from './TransactionsModule';
import { SavingsModule } from './SavingsModule';
import { Calendar } from './ui/Calendar';
import { Select } from './ui/Select';
import { URUGUAY_HOLIDAYS_2024 } from '../utils/holidays';
import { calculateDailyBudget, calculateTotalIncome, calculateSequestration, convertToCurrency, calculateTodaySpend, getCategoryLabel, getImportanceLabel, calculateTotalSavingsContribution, generateDailyInsights, calculatePulseData, predictDayZero, calculatePreviousMonthLeftover, detectVampireExpenses, calculateUltimateFreedomDate } from '../utils/finance';
import { PulseModule } from './PulseModule';
import { parseSmartInput } from '../utils/ai';
import { GuardianMode, Currency, VariableExpense, ExpenseCategory } from '../types';
import { RealitySimulator } from './RealitySimulator';
import { WardenLogo } from './WardenLogo';
import {
    LogOut,
    LayoutDashboard,
    Wallet,
    CreditCard,
    ShieldAlert,
    ShieldCheck,
    TrendingUp,
    Plus,
    Sun,
    Moon,
    Check,
    Sparkles,
    Briefcase,
    Zap,
    Bot,
    List,
    AlertTriangle,
    BrainCircuit,
    PiggyBank,
    X,
    User as UserIcon,
    Settings2,
    CalendarDays,
    Percent,
    Database,
    ArrowLeft,
    ArrowLeft as BackIcon,
    Activity,
    AlertCircle,
    Rocket,
    Shield,
    Lightbulb,
    ChevronRight,
    Coins,
    Lock as LockIcon,
    Calculator
} from 'lucide-react';
import { URUGUAY_NATIONAL_HOLIDAYS } from '../utils/holidays';

// --- Interfaces de Props para Sub-componentes ---

interface NavItemProps {
    view: 'dashboard' | 'budget' | 'debts' | 'transactions' | 'savings';
    icon: any;
    label: string;
    currentView: string;
    onSetView: (view: any) => void;
}

interface TransactionsModuleProps {
    pulseData: any;
    dayZero: any;
    formatMoney: (amount: number) => string;
}

interface DashboardHomeProps {
    remainingDailyAllowance: number;
    verdict: any;
    streakData: any;
    guardianVerdict: any;
    data: any;
    settings: any;
    formatMoney: (amount: number) => string;
    onSetView: (view: any) => void;
    setIsImportCenterOpen: (open: boolean) => void;
    setIsProfileOpen: (open: boolean) => void;
    insights: any[];
    lockVault: () => void;
    setIsSimulatorOpen: (open: boolean) => void;
}

interface ProfileModalProps {
    user: any;
    logout: () => void;
    settings: any;
    data: any;
    updateSettings: (s: any) => void;
    updateData: (d: any) => void;
    onClose: () => void;
    onSetView: (view: any) => void;
    formatMoney: (amount: number) => string;
}

// --- Componentes Atómicos ---

const NavItem: React.FC<NavItemProps> = ({ view, icon: Icon, label, currentView, onSetView }) => (
    <button
        onClick={() => onSetView(view)}
        className={`flex flex-col items-center justify-center w-full py-4 transition-all duration-300 ${currentView === view
            ? 'text-main transform -translate-y-1'
            : 'text-muted hover:text-main'
            } `}
    >
        <div className={`p-1.5 rounded-lg mb-1 transition-all ${currentView === view ? 'bg-surface shadow-[0_0_15px_rgba(255,255,255,0.05)]' : ''} `}>
            <Icon className={`w-5 h-5 ${currentView === view ? 'stroke-[2.5px]' : 'stroke-2'} `} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

const AuditorPanel: React.FC<{
    insights: any[],
    data: any,
    formatMoney: (amount: number) => string,
    settings: any,
    onSetView: (view: any) => void,
    setIsProfileOpen: (open: boolean) => void
}> = ({ insights, data, formatMoney, settings, onSetView, setIsProfileOpen }) => {
    const getIcon = (name: string, type: string) => {
        const icons: any = { AlertCircle, ShieldCheck, Rocket, Shield, TrendingUp, Lightbulb };
        const Icon = icons[name] || Lightbulb;
        const colorClass = type === 'alert' ? 'text-sentry-active' : type === 'success' ? 'text-sentry-liberate' : 'text-main';

        return (
            <div className={`p-2 rounded-lg flex-shrink-0 transition-all duration-500 group-hover:scale-110 ${type === 'alert' ? 'bg-sentry-active/10' :
                type === 'success' ? 'bg-sentry-liberate/10' :
                    'bg-surface'
                }`}>
                <Icon className={`w-4 h-4 ${colorClass}`} />
            </div>
        );
    };

    const totalSavings = (data.savingGoals || []).reduce((acc: number, goal: any) =>
        acc + convertToCurrency(goal.currentAmount, goal.currency, settings.baseCurrency, data.exchangeRate), 0
    );

    if (insights.length === 0) return null;

    return (
        <div className="bg-surface glass-border rounded-[2.5rem] overflow-hidden shadow-luxury border-none">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-sentry-active animate-pulse shadow-[0_0_10px_#FF3B30]" />
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-main leading-none">Sentry</h3>
                            <p className="text-[9px] text-muted font-bold uppercase mt-1 tracking-tighter italic">Status: Observa.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {insights.map((insight, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={insight.id}
                            className="flex gap-4 items-start group relative"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-main font-bold leading-relaxed">{insight.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DashboardHome: React.FC<DashboardHomeProps> = ({
    remainingDailyAllowance,
    verdict,
    streakData,
    guardianVerdict,
    data,
    settings,
    formatMoney,
    onSetView,
    setIsImportCenterOpen,
    setIsProfileOpen,
    insights,
    lockVault,
    setIsSimulatorOpen
}) => (
    <div className="space-y-6">
        {/* Hero Widget: Ración Diaria */}
        <div className="bg-surface glass-border rounded-[2.5rem] p-8 shadow-luxury relative overflow-hidden group mb-8 border-none">
            <div className={`absolute -right-20 -top-20 w-60 h-60 rounded-full blur-[80px] opacity-10 pointer-events-none transition-colors duration-1000 ${remainingDailyAllowance < 0 ? 'bg-sentry-active' : 'bg-sentry-liberate'}`}></div>

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-8">
                    <div className={`px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 border-none bg-background/50 ${remainingDailyAllowance < 0 ? 'text-sentry-active' : 'text-sentry-liberate'} `}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${remainingDailyAllowance < 0 ? 'bg-sentry-active' : 'bg-sentry-liberate'}`} />
                        <span>Protocolo: {remainingDailyAllowance < 0 ? 'Quiebre' : 'Ración'}</span>
                    </div>
                    <div className="flex gap-2">
                        {settings.vaultPIN && (
                            <Button
                                variant="secondary"
                                onClick={() => lockVault()}
                                className="p-3 rounded-2xl bg-background/50 h-auto w-auto"
                                title="Sellar Bóveda"
                            >
                                <LockIcon className="w-5 h-5" />
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            onClick={() => setIsImportCenterOpen(true)}
                            className="p-3 rounded-2xl bg-background/50 h-auto w-auto"
                            title="Importar Datos"
                        >
                            <Database className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setIsSimulatorOpen(true)}
                            className="p-3 rounded-2xl bg-background/50 h-auto w-auto"
                            title="Reality Simulator"
                        >
                            <Calculator className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="text-center sm:text-left py-2">
                    <p className="text-muted text-xs font-black uppercase tracking-widest mb-2 opacity-60">Ración Disponible</p>
                    <h1 className={`text-6xl sm:text-7xl font-black tracking-tighter ${remainingDailyAllowance < 0 ? 'text-sentry-active' : 'text-main'}`}>
                        {formatMoney(remainingDailyAllowance)}
                    </h1>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-6">
                        <p className="text-sm text-muted font-bold italic leading-tight max-w-[200px]">{verdict.sub}</p>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/50 border border-surface">
                            <ShieldCheck className="w-3.5 h-3.5 text-sentry-liberate" />
                            <span className="text-[10px] font-black text-main uppercase tracking-widest">
                                {calculateUltimateFreedomDate(data.debts)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Racha Gamificada (Fase 7.2) */}
        <motion.div
            whileHover={{ scale: 1.01 }}
            className={`relative overflow-hidden rounded-[2.5rem] p-8 shadow-luxury border transition-all duration-500 ${streakData.isStreakBroken ? 'glass glass-border' : 'bg-gradient-to-br from-primary-500 to-emerald-600 border-primary-400'}`}
        >
            {!streakData.isStreakBroken && <LayoutDashboard className="w-32 h-32 absolute -bottom-8 -right-8 opacity-10 text-white" />}

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className={`${streakData.isStreakBroken ? 'text-slate-500' : 'text-emerald-100'} text-xs font-bold uppercase tracking-widest`}>Racha Actual</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-5xl font-black ${streakData.isStreakBroken ? 'text-slate-400' : 'text-white'}`}>
                            {streakData.currentStreak || 0} Días
                        </span>
                        <span className="text-4xl">{streakData.isStreakBroken ? '🧊' : '🔥'}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className={`text-[10px] font-bold uppercase ${streakData.isStreakBroken ? 'text-slate-400' : 'text-emerald-100/80'}`}>Seguimiento Semanal</span>
                    <div className="flex gap-2">
                        {streakData.last7Days.map((d: any, i: number) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <span className={`text-[9px] font-bold ${streakData.isStreakBroken ? 'text-slate-500' : 'text-emerald-100'}`}>{d.day}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${d.status === 'impulsive'
                                    ? 'bg-red-500 border-red-400 text-white'
                                    : d.isToday && !streakData.isStreakBroken
                                        ? 'bg-white border-white text-emerald-600 shadow-sm'
                                        : 'bg-emerald-700/30 border-emerald-400/30 text-emerald-200'
                                    }`}>
                                    {d.status === 'impulsive' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Veredicto del Guardián */}
            <motion.div
                whileHover={{ y: -2 }}
                className={`${guardianVerdict.bg} ${guardianVerdict.border} p-8 rounded-[2rem] border shadow-luxury transition-all flex flex-col justify-between`}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                        {guardianVerdict.icon}
                    </div>
                </div>
                <div>
                    <h3 className="text-slate-800 dark:text-white text-sm font-bold uppercase tracking-tight">{guardianVerdict.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mt-2 font-medium italic">
                        "{guardianVerdict.message}"
                    </p>
                </div>
            </motion.div>

            {/* Widget de Análisis de Flujo Real */}
            <motion.div
                whileHover={{ y: -2 }}
                className="glass glass-border p-8 rounded-[2rem] shadow-luxury flex flex-col justify-between border"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                        <Activity className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">Salud del Flujo</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-black text-main leading-none">
                            {(() => {
                                const totalIncome = data.incomes.reduce((acc: number, inc: any) => acc + convertToCurrency(inc.amount, inc.currency, settings.baseCurrency, data.exchangeRate), 0);
                                const totalFixed = data.fixedExpenses.reduce((acc: number, exp: any) => acc + convertToCurrency(exp.amount, exp.currency, settings.baseCurrency, data.exchangeRate), 0);
                                const peaceOfMind = totalIncome * (settings.peaceOfMindPercentage / 100);
                                const available = totalIncome - totalFixed - peaceOfMind;
                                const health = totalIncome > 0 ? (available / totalIncome) * 100 : 0;
                                return `${health.toFixed(0)}% `;
                            })()}
                        </h3>
                        <span className="text-[10px] font-bold text-muted mb-1">libre de compromisos</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{
                                width: (() => {
                                    const totalIncome = data.incomes.reduce((acc: number, inc: any) => acc + convertToCurrency(inc.amount, inc.currency, settings.baseCurrency, data.exchangeRate), 0);
                                    const totalFixed = data.fixedExpenses.reduce((acc: number, exp: any) => acc + convertToCurrency(exp.amount, exp.currency, settings.baseCurrency, data.exchangeRate), 0);
                                    const peaceOfMind = totalIncome * (settings.peaceOfMindPercentage / 100);
                                    const available = totalIncome - totalFixed - peaceOfMind;
                                    return totalIncome > 0 ? `${Math.max(0, Math.min(100, (available / totalIncome) * 100))}% ` : '0%';
                                })()
                            }}
                            className="h-full bg-primary-500"
                        />
                    </div>
                </div>
            </motion.div>


            {/* Warden Auditor Insights */}
            <div className="md:col-span-2">
                <AuditorPanel
                    insights={insights}
                    data={data}
                    formatMoney={formatMoney}
                    settings={settings}
                    onSetView={onSetView}
                    setIsProfileOpen={setIsProfileOpen}
                />
            </div>
        </div>

        {/* Variable Expenses Feed */}
        <div className="glass glass-border rounded-[2.5rem] p-8 shadow-luxury">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary-500" />
                    Últimos Movimientos
                </h3>
                <button onClick={() => onSetView('transactions')} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Ver todo</button>
            </div>

            <div className="space-y-3">
                {(data.variableExpenses || []).length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm italic bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        Sin actividad reciente.
                    </div>
                ) : (
                    (data.variableExpenses || [])
                        .slice(0, 3)
                        .map((expense: any) => (
                            <div key={expense.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">{expense.description}</p>
                                        <p className="text-[10px] text-slate-400 uppercase">
                                            {getCategoryLabel(expense.category, settings.language)} • {getImportanceLabel(expense.importance, settings.language)}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-800 dark:text-white">{formatMoney(expense.amount)}</span>
                            </div>
                        ))
                )}
            </div>
        </div>
    </div>
);

const SweepingModal: React.FC<{
    amount: number,
    formatMoney: (amount: number) => string,
    savingGoals: any[],
    onSweep: (goalId: string) => void,
    onClose: () => void
}> = ({ amount, formatMoney, savingGoals, onSweep, onClose }) => {
    const [selectedGoal, setSelectedGoal] = React.useState(savingGoals.find(g => !g.targetAmount || g.currentAmount < g.targetAmount)?.id || savingGoals[0]?.id || '');

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-luxury overflow-hidden p-8 text-center relative"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-emerald-500 to-blue-500" />

                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-bounce">
                    <Sparkles className="w-10 h-10" />
                </div>

                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">¡Misión Cumplida!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                    Terminaste el mes pasado con un excedente de <span className="font-bold text-emerald-500">{formatMoney(amount)}</span>.
                    No dejes que se diluya, ¡envíalo a un cofre!
                </p>

                <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-premium">
                    {savingGoals.map(goal => {
                        const isFull = goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount;
                        return (
                            <button
                                key={goal.id}
                                disabled={isFull}
                                onClick={() => setSelectedGoal(goal.id)}
                                className={`w - full p - 4 rounded - 2xl border - 2 transition - all flex items - center justify - between ${isFull ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : selectedGoal === goal.id ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'} `}
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <span className="text-2xl">{goal.icon}</span>
                                    <div>
                                        <p className="text-xs font-black uppercase text-slate-800 dark:text-white leading-none mb-1">{goal.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                            {isFull ? 'Meta Alcanzada 🎉' : `Cofre de ${goal.targetAmount > 0 ? 'Meta' : 'Ahorro General'} `}
                                        </p>
                                    </div>
                                </div>
                                {selectedGoal === goal.id && <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <Button
                        onClick={() => onSweep(selectedGoal)}
                        className="h-14 rounded-2xl text-lg shadow-emerald-500/20"
                        variant="primary"
                    >
                        Barrer a este Cofre
                    </Button>
                    <button
                        onClick={onClose}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 py-2"
                    >
                        Quizás luego (Dejar en cuenta)
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const ProfileModal: React.FC<ProfileModalProps> = ({
    user,
    logout,
    settings,
    data,
    updateSettings,
    updateData,
    onClose,
    onSetView,
    formatMoney
}) => {
    const [activeSettingsView, setActiveSettingsView] = useState<'main' | 'holidays'>('main');

    // Sueldo Nominal Local State (Fase 7.6)
    const [localNominalAmount, setLocalNominalAmount] = useState<number>(data.nominalBaseSalary || 0);
    const [localNominalCurrency, setLocalNominalCurrency] = useState<Currency>(data.nominalBaseCurrency || 'UYU');
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state when external data changes (but not while typing if possible)
    useEffect(() => {
        setLocalNominalAmount(data.nominalBaseSalary);
        setLocalNominalCurrency(data.nominalBaseCurrency);
    }, [data.nominalBaseSalary, data.nominalBaseCurrency, activeSettingsView]);

    const handleSaveNominal = () => {
        setIsSaving(true);
        updateData({
            nominalBaseSalary: localNominalAmount,
            nominalBaseCurrency: localNominalCurrency
        });
        setTimeout(() => setIsSaving(false), 500);
    };

    const guardians: { id: GuardianMode, title: string, desc: string, icon: any }[] = [
        { id: 'military', title: 'Militar', desc: 'Disciplina pura. Sin rodeos.', icon: ShieldAlert },
        { id: 'analytic', title: 'Analítico', desc: 'Basado en datos y eficiencia.', icon: Zap },
        { id: 'colleague', title: 'Colega', desc: 'Amigable pero firme.', icon: Bot },
    ];

    const currencies: Currency[] = ['UYU', 'USD', 'UI', 'UR'];

    const handleToggleHoliday = (dateStr: string) => {
        const isCurrentlyHoliday = settings.customHolidays.some((h: any) => h.date === dateStr);
        let updatedHolidays;
        if (isCurrentlyHoliday) {
            updatedHolidays = settings.customHolidays.filter((h: any) => h.date !== dateStr);
        } else {
            updatedHolidays = [...settings.customHolidays, { date: dateStr, name: 'Custom Holiday', type: 'corporate' }];
        }
        updateSettings({ customHolidays: updatedHolidays });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
            <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-main">
                <div className="p-4 border-b border-main flex justify-between items-center bg-surface-alt">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {activeSettingsView === 'main' ? (
                            <><UserIcon className="w-5 h-5 text-main" /> Perfil & Ajustes</>
                        ) : (
                            <button onClick={() => setActiveSettingsView('main')} className="flex items-center gap-2 hover:text-main transition-colors">
                                <BackIcon className="w-5 h-5" /> Calendario de Precisión
                            </button>
                        )}
                    </h3>
                    <button onClick={() => { onClose(); setActiveSettingsView('main'); }} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <X className="w-5 h-5 text-muted" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-surface">
                    {activeSettingsView === 'main' ? (
                        <>
                            {/* User Info */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-alt border border-main">
                                <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border-4 border-main shadow-sm">
                                    <UserIcon className="w-8 h-8 text-main" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-main uppercase tracking-tight">{user?.name || 'Sujeto Warden'}</h4>
                                    <p className="text-xs text-muted font-medium">{user?.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <div className="px-2 py-0.5 rounded-full bg-sentry-liberate/10 text-[9px] font-bold text-sentry-liberate uppercase tracking-wider">Plan Reality</div>
                                    </div>
                                </div>
                                <button onClick={logout} className="p-2 rounded-xl hover:bg-sentry-active/10 text-sentry-active transition-colors">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>

                            {/* --- PREFERENCIAS FINANCIERAS --- */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <Settings2 className="w-3.5 h-3.5" /> Preferencias Financieras
                                </h4>
                                <div className="space-y-3">
                                    {/* Calendario Button */}
                                    <button onClick={() => setActiveSettingsView('holidays')} className="w-full flex items-center justify-between p-4 rounded-xl border border-main bg-white/5 hover:bg-white/10 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-background text-main">
                                                <CalendarDays className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-main">Calendario de Precisión</p>
                                                <p className="text-[10px] text-muted">Personaliza tus días no laborables</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted group-hover:text-main transition-colors" />
                                    </button>

                                    {/* Fondo Paz Mental Slider */}
                                    <div className="p-4 rounded-xl border border-main bg-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded-lg bg-background text-sentry-observe">
                                                <Percent className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-main">Fondo de Paz Mental</p>
                                                <p className="text-[10px] text-muted">Reserva de seguridad mensual</p>
                                            </div>
                                            <span className="text-sm font-black text-sentry-observe">{settings.peaceOfMindPercentage}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            step="1"
                                            value={settings.peaceOfMindPercentage}
                                            onChange={(e) => updateSettings({ peaceOfMindPercentage: parseInt(e.target.value) })}
                                            className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-main"
                                        />
                                    </div>

                                    {/* Sueldo Nominal Base (Fase 7.6 con Botón Guardar) */}
                                    <div className="p-4 rounded-xl border border-main bg-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded-lg bg-background text-sentry-liberate">
                                                <Coins className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-main">Sueldo liquido base</p>
                                                <p className="text-[10px] text-muted">Valor/hr actual: {formatMoney(data.hourlyRate)}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={localNominalAmount === 0 ? '' : localNominalAmount.toLocaleString('es-UY')}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.replace(/\D/g, '');
                                                        setLocalNominalAmount(parseInt(raw) || 0);
                                                    }}
                                                    className="input-premium h-12"
                                                    placeholder="Monto..."
                                                />
                                            </div>
                                            <Select
                                                value={localNominalCurrency}
                                                onChange={val => setLocalNominalCurrency(val as Currency)}
                                                options={currencies.map(c => ({ value: c, label: c }))}
                                                className="w-28 flex-shrink-0"
                                            />
                                            <Button
                                                variant="primary"
                                                onClick={handleSaveNominal}
                                                disabled={isSaving}
                                                className="px-6 h-12 flex-shrink-0"
                                            >
                                                {isSaving ? '...' : 'Guardar'}
                                            </Button>
                                        </div>
                                        <p className="mt-2 text-[10px] text-muted leading-tight italic">
                                            * Define cómo el Guardián valora tu tiempo. No afecta tu flujo real.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Personalidad del Guardián */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Estilo del Guardián
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {guardians.map((g) => (
                                        <button
                                            key={g.id}
                                            onClick={() => updateSettings({ guardianMode: g.id })}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${settings.guardianMode === g.id
                                                ? 'bg-main/10 border-main ring-1 ring-main'
                                                : 'bg-white/5 border-main hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${settings.guardianMode === g.id ? 'bg-main text-background' : 'bg-background text-muted'}`}>
                                                <g.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-main">{g.title}</p>
                                                <p className="text-[10px] text-muted font-medium">{g.desc}</p>
                                            </div>
                                            {settings.guardianMode === g.id && <Check className="w-4 h-4 text-main" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 rounded-xl border border-main bg-surface">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-muted uppercase">Moneda Base</span>
                                        <Coins className="w-3 h-3 text-main" />
                                    </div>
                                    <Select
                                        value={settings.baseCurrency}
                                        onChange={val => updateSettings({ baseCurrency: val as Currency })}
                                        options={currencies.map(c => ({ value: c, label: c }))}
                                    />
                                </div>
                            </div>

                            {/* --- SEGURIDAD (VAULT) --- */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5" /> Seguridad (Warden Vault)
                                </h4>
                                <div className="p-4 rounded-xl border border-main bg-white dark:bg-slate-800/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-background text-main">
                                                <LockIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-main">PIN de Acceso</p>
                                                <p className="text-[10px] text-muted">Protege tus datos cifrados</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${settings.vaultPIN ? 'bg-sentry-liberate/10 text-sentry-liberate' : 'bg-white/5 text-muted'}`}>
                                            {settings.vaultPIN ? 'Activo' : 'Inactivo'}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            maxLength={4}
                                            placeholder={settings.vaultPIN ? "****" : "Nuevo PIN"}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length === 4) {
                                                    updateSettings({ vaultPIN: val });
                                                    e.target.value = '';
                                                }
                                            }}
                                            className="input-premium flex-1 text-center font-mono tracking-widest"
                                        />
                                        {settings.vaultPIN && (
                                            <button
                                                onClick={() => updateSettings({ vaultPIN: undefined })}
                                                className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Quitar
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-3 text-[9px] text-slate-400 leading-tight italic">
                                        * El PIN cifra tus datos localmente. Warden se bloqueará cada vez que reinicies la app.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="animate-fade-in">
                            <Calendar
                                onToggleDate={handleToggleHoliday}
                                selectedDates={settings.customHolidays}
                                nationalHolidays={URUGUAY_NATIONAL_HOLIDAYS}
                            />
                            <div className="mt-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
                                <p className="text-[10px] text-primary-800 dark:text-primary-200 font-medium leading-relaxed">
                                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                                    Toca una fecha para marcarla como no laborable. Esto recalculará automáticamente tu **Valor Hora** basándose en los días de remo reales.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                    <Button onClick={() => { onClose(); setActiveSettingsView('main'); }} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary-600/20">
                        Listo
                    </Button>
                </div>
            </div>
        </div >
    );
};

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { settings, data, updateSettings, updateData, addVariableExpense, lockVault } = useStore();

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat(settings.language, {
            style: 'currency',
            currency: settings.baseCurrency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Dashboard Calculations
    const totalIncome = calculateTotalIncome(data.incomes || [], settings.baseCurrency, data.exchangeRate);
    const sequestration = calculateSequestration(data.fixedExpenses || [], settings.baseCurrency, data.exchangeRate);

    const totalDebtMinPayments = (data.debts || []).reduce((acc, d) => {
        return acc + convertToCurrency(d.minimumPayment, d.currency, settings.baseCurrency, data.exchangeRate);
    }, 0);

    const totalDebtsAmount = (data.debts || []).reduce((acc, d) => {
        return acc + convertToCurrency(d.remainingAmount, d.currency, settings.baseCurrency, data.exchangeRate);
    }, 0);

    const totalSavingsContribution = calculateTotalSavingsContribution(data.savingGoals || [], settings.baseCurrency, data.exchangeRate);

    const today = new Date();
    // Navigation & Modal States (Moved here for better organization)
    const [currentView, setCurrentView] = useState<'dashboard' | 'budget' | 'debts' | 'transactions' | 'savings'>('dashboard');
    const [isImportCenterOpen, setIsImportCenterOpen] = useState(false);
    const [isConfessionOpen, setIsConfessionOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
    const [isSweepingModalOpen, setIsSweepingModalOpen] = useState(false);
    const [leftoverAmount, setLeftoverAmount] = useState(0);

    // --- Detection for Smart Sweeping ---
    useEffect(() => {
        if (!data || !settings.setupComplete) return;

        const d = new Date();
        const lastMonth = new Date(d.getFullYear(), d.getMonth(), 0);
        const prevMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

        // Si no hemos barrido el mes pasado aún
        if (data.lastSweptMonth !== prevMonthKey) {
            const leftover = calculatePreviousMonthLeftover(data, settings);
            if (leftover > 100) { // Umbral mínimo 100 UYU
                setLeftoverAmount(leftover);
                setIsSweepingModalOpen(true);
            } else {
                // Si no hay sobrante suficiente, marcamos como barrido igual para no chequear más
                updateData({ lastSweptMonth: prevMonthKey });
            }
        }
    }, [data, settings.setupComplete]);

    const handleSweep = (goalId: string) => {
        const goal = data.savingGoals.find(g => g.id === goalId);
        if (goal) {
            let amountToSweep = leftoverAmount;
            // Si la meta tiene un target y el monto actual + el sobrante excede el target, ajustar el monto a barrer
            if (goal.targetAmount && (goal.currentAmount + leftoverAmount) > goal.targetAmount) {
                amountToSweep = goal.targetAmount - goal.currentAmount;
            }

            const updatedGoals = data.savingGoals.map(g =>
                g.id === goalId ? { ...g, currentAmount: g.currentAmount + amountToSweep } : g
            );

            const lastMonth = new Date();
            lastMonth.setDate(0); // Último día del mes pasado
            const prevMonthKey = `${lastMonth.getFullYear()} -${String(lastMonth.getMonth() + 1).padStart(2, '0')} `;

            updateData({
                savingGoals: updatedGoals,
                lastSweptMonth: prevMonthKey
            });
            setIsSweepingModalOpen(false);
        }
    };

    // Warden Auditor Insights
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDayValue = now.getDate();
    const dailyInsights = generateDailyInsights(data, settings, daysInMonth, currentDayValue);
    const [activeSettingsView, setActiveSettingsView] = useState<'main' | 'holidays'>('main');
    const [confessionText, setConfessionText] = useState('');
    const [isImpulsive, setIsImpulsive] = useState(false);

    const baseDailyAllowance = calculateDailyBudget(
        totalIncome,
        sequestration.total,
        totalDebtMinPayments,
        totalSavingsContribution,
        settings.peaceOfMindPercentage,
        daysInMonth,
        currentDayValue,
        data.variableExpenses || [],
        settings.baseCurrency,
        data.exchangeRate
    );

    const spentToday = calculateTodaySpend(
        data.variableExpenses || [],
        settings.baseCurrency,
        data.exchangeRate
    );

    const remainingDailyAllowance = baseDailyAllowance - spentToday;

    const impulsiveExpensesToday = (data.variableExpenses || [])
        .filter(e => new Date(e.date).toDateString() === today.toDateString() && e.isImpulsive);

    const impulsiveCount = impulsiveExpensesToday.length;
    const totalImpulsiveAmountToday = impulsiveExpensesToday.reduce((acc, e) => {
        return acc + convertToCurrency(e.amount, e.currency, settings.baseCurrency, data.exchangeRate);
    }, 0);

    const wastedHours = data.hourlyRate > 0 ? totalImpulsiveAmountToday / data.hourlyRate : 0;

    const getGuardianVerdictContent = () => {
        const isImpulsive = impulsiveCount > 0;
        const formattedAmount = formatMoney(totalImpulsiveAmountToday);
        const formattedHours = wastedHours.toFixed(1);

        if (settings.guardianMode === 'military') {
            return isImpulsive
                ? {
                    title: "NO.",
                    message: `Traición detectada. Malgastaste hoy.`,
                    icon: <ShieldAlert className="w-6 h-6 text-sentry-active" />,
                    bg: "bg-sentry-active/10",
                    border: "border-sentry-active/30"
                }
                : {
                    title: "ORDEN.",
                    message: "Cumples el protocolo. Avanzas.",
                    icon: <ShieldCheck className="w-6 h-6 text-sentry-liberate" />,
                    bg: "bg-sentry-liberate/10",
                    border: "border-sentry-liberate/30"
                };
        }

        if (settings.guardianMode === 'analytic') {
            return isImpulsive
                ? {
                    title: "DESVÍO.",
                    message: `Ineficiencia por impulsos detectada.`,
                    icon: <Zap className="w-6 h-6 text-sentry-observe" />,
                    bg: "bg-sentry-observe/10",
                    border: "border-sentry-observe/30"
                }
                : {
                    title: "ÓPTIMO.",
                    message: "Ratio de ahorro mantenido.",
                    icon: <Zap className="w-6 h-6 text-sentry-liberate" />,
                    bg: "bg-sentry-liberate/10",
                    border: "border-sentry-liberate/30"
                };
        }

        // Colleague mode (Sentry direct voice)
        return isImpulsive
            ? {
                title: "TE VEO.",
                message: `Me traicionaste. No debías.`,
                icon: <Bot className="w-6 h-6 text-sentry-active" />,
                bg: "bg-sentry-active/10",
                border: "border-sentry-active/30"
            }
            : {
                title: "SIGO AQUÍ.",
                message: "Estamos a mano. Cumpliste.",
                icon: <Bot className="w-6 h-6 text-sentry-liberate" />,
                bg: "bg-sentry-liberate/10",
                border: "border-sentry-liberate/30"
            };
    };

    const guardianVerdict = getGuardianVerdictContent();

    const getVerdict = () => {
        if (remainingDailyAllowance < 0) return {
            text: 'TRAICIÓN.',
            sub: 'Gastaste fuera de protocolo.',
            color: 'text-sentry-active',
            bg: 'bg-sentry-active/10 border-sentry-active/30',
            icon: <AlertTriangle className="w-5 h-5" />
        };

        if (impulsiveCount > 0) return {
            text: 'TENSIÓN.',
            sub: 'Detecté impulsos. Me traicionas.',
            color: 'text-sentry-observe',
            bg: 'bg-sentry-observe/10 border-sentry-observe/30',
            icon: <ShieldAlert className="w-5 h-5" />
        };

        if (remainingDailyAllowance < 200) return {
            text: 'RESTRICCIÓN.',
            sub: 'Liquidez crítica. No gastes.',
            color: 'text-sentry-observe',
            bg: 'bg-sentry-observe/10 border-sentry-observe/40',
            icon: <ShieldAlert className="w-5 h-5" />
        };

        return {
            text: 'CUMPLIMIENTO.',
            sub: 'Todo bajo control. Sigo.',
            color: 'text-sentry-liberate',
            bg: 'bg-sentry-liberate/10 border-sentry-liberate/30',
            icon: <ShieldCheck className="w-5 h-5" />
        };
    };
    const verdict = getVerdict();

    // --- Lógica de Racha y Tracker Semanal (Fase 7.2) ---
    const getStreakData = () => {
        const last7Days = [];
        const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
        const now = new Date();

        let currentStreak = 0;
        let isStreakBroken = false;

        // Generar estados de los últimos 7 días
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            const dateString = date.toDateString();
            const dayName = dayNames[date.getDay()];

            const hasImpulsive = (data.variableExpenses || []).some(e =>
                new Date(e.date).toDateString() === dateString && e.isImpulsive
            );

            last7Days.push({
                day: dayName,
                status: hasImpulsive ? 'impulsive' : 'clean',
                isToday: i === 0
            });
        }

        // Calcular racha actual (hacia atrás hasta encontrar un impulso o cambio de día)
        // Nota: Una racha real contaría días seguidos sin impulsos.
        // Simplificación: si hoy no hay impulsos, racha = días seguidos hacia atrás sin impulsos.
        let checkDate = new Date();
        while (true) {
            const checkDateString = checkDate.toDateString();
            const hasImpulsive = (data.variableExpenses || []).some(e =>
                new Date(e.date).toDateString() === checkDateString && e.isImpulsive
            );

            if (hasImpulsive) break;

            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);

            // Evitaremos loops infinitos o rachas imposibles por ahora
            if (currentStreak > 365) break;
        }

        // Si hoy hay impulso, la racha es 0
        const todayHasImpulsive = (data.variableExpenses || []).some(e =>
            new Date(e.date).toDateString() === now.toDateString() && e.isImpulsive
        );
        if (todayHasImpulsive) {
            currentStreak = 0;
            isStreakBroken = true;
        }

        return { last7Days, currentStreak, isStreakBroken };
    };

    const streakData = getStreakData();

    const handleConfessionSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const parsedExpenses = parseSmartInput(confessionText);

        if (parsedExpenses.length === 0) {
            alert("Guardián: No entendí tu gasto. Intenta '500 comida' o '200 taxi'.");
            return;
        }

        parsedExpenses.forEach(parsed => {
            const newExpense: VariableExpense = {
                id: Math.random().toString(36).substr(2, 9),
                amount: parsed.amount,
                currency: settings.baseCurrency,
                category: parsed.category,
                description: parsed.description,
                importance: isImpulsive ? 'leisure' : parsed.importance,
                isImpulsive: isImpulsive,
                date: new Date().toISOString(),
                timestamp: Date.now()
            };
            addVariableExpense(newExpense);
        });

        setConfessionText('');
        setIsImpulsive(false);
        setIsConfessionOpen(false);
    };




    return (
        <div className="min-h-screen bg-background transition-colors duration-300 font-sans selection:bg-sentry-active selection:text-white">

            {/* Top Bar - Warden Header */}
            <header className="bg-background/80 backdrop-blur-md border-b border-surface sticky top-0 z-20">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <WardenLogo size={32} showText={false} />
                        <span className="font-black text-main text-lg tracking-tighter">WARDEN.</span>
                    </div>

                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => setIsProfileOpen(true)}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-none">Sujeto</p>
                            <p className="text-xs font-bold text-main">{user?.name}</p>
                        </div>
                        <img src={user?.avatar} alt="User" className="w-9 h-9 rounded-full border-2 border-surface group-hover:border-sentry-active transition-colors shadow-lg" />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-2xl mx-auto px-4 pt-6 relative min-h-[85vh]">
                <AnimatePresence mode="popLayout" initial={false}>
                    {currentView === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="pb-24 w-full"
                        >
                            <DashboardHome
                                remainingDailyAllowance={remainingDailyAllowance}
                                verdict={verdict}
                                streakData={streakData}
                                guardianVerdict={guardianVerdict}
                                data={data}
                                settings={settings}
                                formatMoney={formatMoney}
                                setIsImportCenterOpen={setIsImportCenterOpen}
                                setIsProfileOpen={setIsProfileOpen}
                                setIsSimulatorOpen={setIsSimulatorOpen}
                                onSetView={setCurrentView}
                                insights={dailyInsights}
                                lockVault={lockVault}
                            />
                        </motion.div>
                    )}

                    {currentView === 'budget' && (
                        <motion.div
                            key="budget"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="pb-24 w-full origin-top"
                        >
                            <div className="mb-6 px-1">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Previsión</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Control de Ingresos y Gastos Fijos</p>
                            </div>
                            <BudgetModule
                                pulseData={calculatePulseData(data, settings, daysInMonth, currentDayValue)}
                                dayZero={predictDayZero(
                                    calculatePulseData(data, settings, daysInMonth, currentDayValue).initialDisposable,
                                    calculatePulseData(data, settings, daysInMonth, currentDayValue).currentSpent,
                                    currentDayValue,
                                    daysInMonth
                                )}
                                formatMoneyProp={formatMoney}
                                daysInMonth={daysInMonth}
                                currentDay={currentDayValue}
                            />
                        </motion.div>
                    )}

                    {currentView === 'debts' && (
                        <motion.div
                            key="debts"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="pb-24 w-full origin-top"
                        >
                            <div className="mb-6 px-1">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Pasivos</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Estrategia de Desendeudamiento</p>
                            </div>
                            <DebtModule />
                        </motion.div>
                    )}

                    {currentView === 'transactions' && (
                        <motion.div
                            key="transactions"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="pb-24 w-full origin-top"
                        >
                            <div className="mb-6 px-1">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Movimientos</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Auditoría y Analítica de Gasto</p>
                            </div>
                            <TransactionsModule
                                pulseData={calculatePulseData(data, settings, daysInMonth, currentDayValue)}
                                dayZero={predictDayZero(
                                    calculatePulseData(data, settings, daysInMonth, currentDayValue).initialDisposable,
                                    calculatePulseData(data, settings, daysInMonth, currentDayValue).currentSpent,
                                    currentDayValue,
                                    daysInMonth
                                )}
                                formatMoneyProp={formatMoney}
                            />
                        </motion.div>
                    )}

                    {currentView === 'savings' && (
                        <motion.div
                            key="savings"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="pb-24 w-full origin-top"
                        >
                            <div className="mb-6 px-1">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bóveda</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tus Cofres de Ahorro</p>
                            </div>
                            <SavingsModule />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Navigation Bar - Warden Style */}
            <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-surface z-30 pb-safe">
                <div className="max-w-2xl mx-auto flex justify-around items-center px-4">
                    <NavItem view="dashboard" icon={LayoutDashboard} label="Inicio" currentView={currentView} onSetView={setCurrentView} />
                    <NavItem view="budget" icon={Wallet} label="Previsión" currentView={currentView} onSetView={setCurrentView} />

                    {/* Central FAB - Sentry Input */}
                    <div className="relative -top-6 px-2">
                        <button
                            onClick={() => setIsConfessionOpen(true)}
                            className="w-16 h-16 bg-main rounded-2xl flex items-center justify-center text-background shadow-[0_0_20px_rgba(245,245,247,0.2)] hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-background group"
                        >
                            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    <NavItem view="savings" icon={PiggyBank} label="Bóvedas" currentView={currentView} onSetView={setCurrentView} />
                    <NavItem view="debts" icon={CreditCard} label="Deudas" currentView={currentView} onSetView={setCurrentView} />
                </div>
            </nav>

            {/* Modals */}
            {isConfessionOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-surface w-full max-w-sm rounded-[2rem] border border-surface shadow-2xl overflow-hidden transform transition-all scale-100 p-8">
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-sentry-active/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-sentry-active shadow-[0_0_15px_rgba(255,59,48,0.2)]">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-main tracking-tighter uppercase">Sentry: Entrada</h3>
                            <p className="text-[10px] text-muted font-bold uppercase mt-2 tracking-widest italic">
                                Sentry procesa tu realidad.<br />Ej: "1500 súper y 200 taxi"
                            </p>
                        </div>

                        <form onSubmit={handleConfessionSubmit}>
                            <textarea
                                autoFocus
                                className="w-full h-24 p-4 rounded-xl bg-background border border-surface focus:border-sentry-active transition-colors outline-none resize-none text-center text-xl text-main font-bold placeholder-surface"
                                placeholder="..."
                                value={confessionText}
                                onChange={(e) => setConfessionText(e.target.value)}
                            />

                            <div className="flex items-center justify-center gap-4 my-6">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest">¿Traición Impulsiva?</label>
                                <div
                                    className={`w-12 h-6 rounded-lg p-1 cursor-pointer transition-colors ${isImpulsive ? 'bg-sentry-active' : 'bg-surface'}`}
                                    onClick={() => setIsImpulsive(!isImpulsive)}
                                >
                                    <div className={`w-4 h-4 bg-main rounded-sm transform transition-transform ${isImpulsive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button className="px-6 py-3 rounded-xl text-muted font-bold text-xs uppercase tracking-widest hover:text-main transition-colors" type="button" onClick={() => setIsConfessionOpen(false)}>Cancelar</button>
                                <button className="px-6 py-3 rounded-xl bg-main text-background font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform" type="submit">Procesar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isProfileOpen && (
                <ProfileModal
                    user={user}
                    logout={logout}
                    settings={settings}
                    data={data}
                    updateSettings={updateSettings}
                    updateData={updateData}
                    onClose={() => setIsProfileOpen(false)}
                    onSetView={setCurrentView}
                    formatMoney={formatMoney}
                />
            )}

            {isImportCenterOpen && (
                <ImportCenter onClose={() => setIsImportCenterOpen(false)} />
            )}

            {isSweepingModalOpen && (
                <SweepingModal
                    amount={leftoverAmount}
                    formatMoney={formatMoney}
                    savingGoals={data.savingGoals}
                    onSweep={handleSweep}
                    onClose={() => {
                        const lastMonth = new Date();
                        lastMonth.setDate(0);
                        const prevMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
                        updateData({ lastSweptMonth: prevMonthKey });
                        setIsSweepingModalOpen(false);
                    }}
                />
            )}

            {isSimulatorOpen && (
                <RealitySimulator onClose={() => setIsSimulatorOpen(false)} />
            )}

        </div>
    );
};