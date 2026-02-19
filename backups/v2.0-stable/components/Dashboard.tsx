import React, { useState, useEffect } from 'react';
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
import { URUGUAY_HOLIDAYS_2024 } from '../utils/holidays';
import { calculateDailyBudget, calculateTotalIncome, calculateSequestration, convertToCurrency, calculateTodaySpend, getCategoryLabel, getImportanceLabel, calculateTotalSavingsContribution } from '../utils/finance';
import { parseSmartInput } from '../utils/ai';
import { GuardianMode, Currency, VariableExpense, ExpenseCategory } from '../types';
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
    Coins,
    ChevronRight,
    Database,
    ArrowLeft as BackIcon,
    Activity
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
        className={`flex flex-col items-center justify-center w-full py-3 transition-all duration-300 ${currentView === view
            ? 'text-primary-600 dark:text-primary-400 transform -translate-y-1'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
    >
        <div className={`p-1 rounded-full mb-1 transition-all ${currentView === view ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
            <Icon className={`w-6 h-6 ${currentView === view ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        </div>
        <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </button>
);

const DashboardHome: React.FC<DashboardHomeProps> = ({
    remainingDailyAllowance,
    verdict,
    streakData,
    guardianVerdict,
    data,
    settings,
    formatMoney,
    onSetView,
    setIsImportCenterOpen
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6 pb-24"
    >
        {/* Hero Widget */}
        <div className="glass glass-border rounded-[2.5rem] p-8 shadow-luxury relative overflow-hidden group mb-8">
            <div className={`absolute -right-20 -top-20 w-60 h-60 rounded-full blur-[80px] opacity-20 pointer-events-none transition-colors duration-1000 ${remainingDailyAllowance < 0 ? 'bg-red-500' : 'bg-primary-500'}`}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${verdict.bg} ${verdict.color}`}>
                        {verdict.icon}
                        <span>{verdict.text}</span>
                    </div>
                    <button
                        onClick={() => setIsImportCenterOpen(true)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-primary-500 transition-colors"
                        title="Importar Datos"
                    >
                        <Database className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center sm:text-left py-2">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Disponible para Hoy</p>
                    <h1 className={`text-5xl sm:text-6xl font-black tracking-tighter ${remainingDailyAllowance < 0 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                        {formatMoney(remainingDailyAllowance)}
                    </h1>
                    <p className="text-xs text-slate-400 mt-2 font-medium">{verdict.sub}</p>
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
                                return `${health.toFixed(0)}%`;
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
                                    return totalIncome > 0 ? `${Math.max(0, Math.min(100, (available / totalIncome) * 100))}%` : '0%';
                                })()
                            }}
                            className="h-full bg-primary-500"
                        />
                    </div>
                </div>
            </motion.div>
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
    </motion.div>
);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {activeSettingsView === 'main' ? (
                            <><UserIcon className="w-5 h-5 text-primary-600" /> Perfil & Ajustes</>
                        ) : (
                            <button onClick={() => setActiveSettingsView('main')} className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                                <BackIcon className="w-5 h-5" /> Calendario de Precisión
                            </button>
                        )}
                    </h3>
                    <button onClick={() => { onClose(); setActiveSettingsView('main'); }} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {activeSettingsView === 'main' ? (
                        <>
                            {/* User Info */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-alt border border-main">
                                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm">
                                    <UserIcon className="w-8 h-8 text-primary-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-main uppercase tracking-tight">{user?.name || 'Usuario Flux'}</h4>
                                    <p className="text-xs text-muted font-medium">{user?.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <div className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Plan Reality</div>
                                    </div>
                                </div>
                                <button onClick={logout} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
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
                                    <button onClick={() => setActiveSettingsView('holidays')} className="w-full flex items-center justify-between p-4 rounded-xl border border-main bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                                                <CalendarDays className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-main">Calendario de Precisión</p>
                                                <p className="text-[10px] text-muted">Personaliza tus días no laborables</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                    </button>

                                    {/* Fondo Paz Mental Slider */}
                                    <div className="p-4 rounded-xl border border-main bg-white dark:bg-slate-800/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                                <Percent className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-main">Fondo de Paz Mental</p>
                                                <p className="text-[10px] text-muted">Reserva de seguridad mensual</p>
                                            </div>
                                            <span className="text-sm font-black text-orange-600">{settings.peaceOfMindPercentage}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            step="1"
                                            value={settings.peaceOfMindPercentage}
                                            onChange={(e) => updateSettings({ peaceOfMindPercentage: parseInt(e.target.value) })}
                                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                        />
                                    </div>

                                    {/* Sueldo Nominal Base (Fase 7.6 con Botón Guardar) */}
                                    <div className="p-4 rounded-xl border border-main bg-white dark:bg-slate-800/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                                <Coins className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-main">Sueldo Nominal Base</p>
                                                <p className="text-[10px] text-muted">Valor/hr actual: {formatMoney(data.hourlyRate)}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    value={localNominalAmount || ''}
                                                    onChange={(e) => setLocalNominalAmount(parseFloat(e.target.value) || 0)}
                                                    className="input-premium"
                                                    placeholder="Monto..."
                                                />
                                            </div>
                                            <select
                                                value={localNominalCurrency}
                                                onChange={(e) => setLocalNominalCurrency(e.target.value as Currency)}
                                                className="select-premium px-2"
                                            >
                                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <button
                                                onClick={handleSaveNominal}
                                                disabled={isSaving}
                                                className={`px-3 py-2 rounded-lg font-bold text-xs transition-all ${isSaving ? 'bg-surface-alt text-muted' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                                            >
                                                {isSaving ? '...' : 'Guardar'}
                                            </button>
                                        </div>
                                        <p className="mt-2 text-[10px] text-slate-400 leading-tight italic">
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
                                                ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 ring-1 ring-primary-500'
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${settings.guardianMode === g.id ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                <g.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-xs font-bold ${settings.guardianMode === g.id ? 'text-primary-900 dark:text-primary-100' : 'text-slate-700 dark:text-slate-300'}`}>{g.title}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{g.desc}</p>
                                            </div>
                                            {settings.guardianMode === g.id && <Check className="w-4 h-4 text-primary-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preferencias de Visualización */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                        <LayoutDashboard className="w-3.5 h-3.5" /> Visualización
                                    </h4>
                                </div>
                                <button
                                    onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
                                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-200 transition-all group"
                                >
                                    <div className="flex items-center gap-2">
                                        {settings.theme === 'light' ? <Sun className="w-4 h-4 text-orange-500" /> : <Moon className="w-4 h-4 text-blue-400" />}
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tema</span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.theme === 'dark' ? 'bg-primary-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${settings.theme === 'dark' ? 'left-5' : 'left-1'}`}></div>
                                    </div>
                                </button>

                                <div className="p-3 rounded-xl border border-main bg-white dark:bg-slate-800">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-muted uppercase">Moneda Base</span>
                                        <Coins className="w-3 h-3 text-primary-500" />
                                    </div>
                                    <select
                                        value={settings.baseCurrency}
                                        onChange={(e) => updateSettings({ baseCurrency: e.target.value as Currency })}
                                        className="w-full bg-surface border-none p-0 text-xs font-black text-main outline-none cursor-pointer"
                                    >
                                        {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
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
        </div>
    );
};

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { settings, data, updateSettings, updateData, addVariableExpense } = useStore();

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
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentDay = today.getDate();

    // Navigation & Modal States (Moved here for better organization)
    const [currentView, setCurrentView] = useState<'dashboard' | 'budget' | 'debts' | 'transactions' | 'savings'>('dashboard');
    const [isConfessionOpen, setIsConfessionOpen] = useState(false);
    const [isImportCenterOpen, setIsImportCenterOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
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
        currentDay,
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
                    title: "Veredicto: ¡Indisciplina!",
                    message: `Gastaste ${formattedAmount} al divino botón. Tiraste ${formattedHours} horas de tu laburo hoy.`,
                    icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
                    bg: "bg-red-50 dark:bg-red-900/20",
                    border: "border-red-200 dark:border-red-800"
                }
                : {
                    title: "Veredicto: Firme",
                    message: "Tu esfuerzo de hoy está intacto, gran laburo. Seguí así.",
                    icon: <ShieldCheck className="w-6 h-6 text-primary-600" />,
                    bg: "bg-primary-50 dark:bg-primary-900/20",
                    border: "border-primary-200 dark:border-primary-800"
                };
        }

        if (settings.guardianMode === 'analytic') {
            return isImpulsive
                ? {
                    title: "Análisis de Fuga",
                    message: `Desvío impulsivo de ${formattedAmount}. Impacto de eficiencia: -${formattedHours}hs laborales.`,
                    icon: <Zap className="w-6 h-6 text-orange-500" />,
                    bg: "bg-orange-50 dark:bg-orange-900/20",
                    border: "border-orange-200 dark:border-orange-800"
                }
                : {
                    title: "Estado de Optimización",
                    message: "Cero fugas detectadas hoy. Ratio de ahorro proyectado en niveles óptimos.",
                    icon: <Zap className="w-6 h-6 text-primary-500" />,
                    bg: "bg-slate-50 dark:bg-slate-900/30",
                    border: "border-slate-200 dark:border-slate-700"
                };
        }

        // Colleague mode (default)
        return isImpulsive
            ? {
                title: "Ojo con eso, che",
                message: `Esos ${formattedAmount} dolieron. Son casi ${formattedHours} horas de remo que regalaste.`,
                icon: <Bot className="w-6 h-6 text-blue-500" />,
                bg: "bg-blue-50 dark:bg-blue-900/20",
                border: "border-blue-200 dark:border-blue-800"
            }
            : {
                title: "¡Vamo' arriba!",
                message: "Día redondito. No hubo impulsos y tu colchón financiero te lo agradece.",
                icon: <Bot className="w-6 h-6 text-primary-600" />,
                bg: "bg-primary-50 dark:bg-primary-900/20",
                border: "border-primary-200 dark:border-primary-800"
            };
    };

    const guardianVerdict = getGuardianVerdictContent();

    const getVerdict = () => {
        if (remainingDailyAllowance < 0) return {
            text: 'Racha Rota',
            sub: 'Has gastado más de lo disponible.',
            color: 'text-red-600',
            bg: 'bg-red-50 border-red-200',
            icon: <AlertTriangle className="w-5 h-5" />
        };

        if (impulsiveCount > 0) return {
            text: 'Disciplina Comprometida',
            sub: `${impulsiveCount} gastos impulsivos hoy.`,
            color: 'text-orange-600',
            bg: 'bg-orange-50 border-orange-200',
            icon: <ShieldAlert className="w-5 h-5" />
        };

        if (remainingDailyAllowance < 200) return {
            text: 'Modo Guerra',
            sub: 'Liquidez ajustada.',
            color: 'text-yellow-600',
            bg: 'bg-yellow-50 border-yellow-200',
            icon: <ShieldAlert className="w-5 h-5" />
        };

        return {
            text: 'Zona Segura',
            sub: 'Finanzas bajo control.',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-200',
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">

            {/* Top Bar */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-md">F</div>
                        <span className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">Flux</span>
                    </div>

                    {/* User Avatar - Trigger for Profile Modal */}
                    <div
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsProfileOpen(true)}
                    >
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden sm:block">{user?.name}</span>
                        <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-2xl mx-auto px-4 pt-6">
                <AnimatePresence mode="wait">
                    {currentView === 'dashboard' && (
                        <DashboardHome
                            key="dashboard"
                            remainingDailyAllowance={remainingDailyAllowance}
                            verdict={verdict}
                            streakData={streakData}
                            guardianVerdict={guardianVerdict}
                            data={data}
                            settings={settings}
                            formatMoney={formatMoney}
                            onSetView={setCurrentView}
                            setIsImportCenterOpen={setIsImportCenterOpen}
                        />
                    )}

                    {currentView === 'budget' && (
                        <motion.div
                            key="budget"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="pb-24"
                        >
                            <div className="mb-6 px-1">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Previsión</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Control de Ingresos y Gastos Fijos</p>
                            </div>
                            <BudgetModule />
                        </motion.div>
                    )}

                    {currentView === 'debts' && (
                        <motion.div
                            key="debts"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="pb-24"
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
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="pb-24"
                        >
                            <div className="mb-6 px-1">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Movimientos</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Auditoría y Analítica de Gasto</p>
                            </div>
                            <TransactionsModule />
                        </motion.div>
                    )}

                    {currentView === 'savings' && (
                        <motion.div
                            key="savings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="pb-24"
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

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-30 pb-safe">
                <div className="max-w-2xl mx-auto flex justify-around items-center px-2">
                    <NavItem view="dashboard" icon={LayoutDashboard} label="Inicio" currentView={currentView} onSetView={setCurrentView} />
                    <NavItem view="budget" icon={Wallet} label="Previsión" currentView={currentView} onSetView={setCurrentView} />

                    {/* Central FAB - Confesar Gasto */}
                    <div className="relative -top-5 px-2">
                        <button
                            onClick={() => setIsConfessionOpen(true)}
                            className="w-16 h-16 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-600/40 hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white dark:border-slate-900 group"
                        >
                            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    <NavItem view="savings" icon={PiggyBank} label="Cofres" currentView={currentView} onSetView={setCurrentView} />
                    <NavItem view="debts" icon={CreditCard} label="Deudas" currentView={currentView} onSetView={setCurrentView} />
                </div>
            </nav>

            {/* Modals */}
            {isConfessionOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 p-6">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-primary-600">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Confesión Inteligente</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Flux separa gastos compuestos.<br />Ej: "1500 súper y 200 taxi"
                            </p>
                        </div>

                        <form onSubmit={handleConfessionSubmit}>
                            <textarea
                                autoFocus
                                className="w-full h-24 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-primary-500 resize-none text-center text-lg text-slate-800 dark:text-white placeholder-slate-300"
                                placeholder="..."
                                value={confessionText}
                                onChange={(e) => setConfessionText(e.target.value)}
                            />

                            <div className="flex items-center justify-center gap-3 my-4">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">¿Gasto Impulsivo?</label>
                                <div
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isImpulsive ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                                    onClick={() => setIsImpulsive(!isImpulsive)}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isImpulsive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Button variant="ghost" type="button" onClick={() => setIsConfessionOpen(false)}>Cancelar</Button>
                                <Button type="submit">Confesar</Button>
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

        </div>
    );
};