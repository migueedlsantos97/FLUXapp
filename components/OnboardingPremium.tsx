import * as React from 'react';
import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from './ui/Button';
import { UserSettings, GuardianMode, Currency, Holiday, FinancialData } from '../types';
import { URUGUAY_HOLIDAYS_2024 } from '../utils/holidays';
import { Calendar } from './ui/Calendar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe,
    Calendar as CalendarIcon,
    Bot,
    Palette,
    Check,
    Briefcase,
    Zap,
    ArrowRight,
    ArrowLeft,
    Coins,
    ShieldCheck,
    Clock,
    Percent,
    Lock as LockIcon
} from 'lucide-react';

export const OnboardingPremium: React.FC = () => {
    const { settings, data, updateSettings, updateData } = useStore();
    const [step, setStep] = useState(0);
    const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
    const [localData, setLocalData] = useState<FinancialData>(data);

    const handleUpdateSettings = (key: keyof UserSettings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleUpdateData = (key: keyof FinancialData, value: any) => {
        setLocalData(prev => ({ ...prev, [key]: value }));
    };

    const handleToggleHoliday = (dateStr: string) => {
        const exists = localSettings.customHolidays.find(h => h.date === dateStr);
        let updatedHolidays;
        if (exists) {
            updatedHolidays = localSettings.customHolidays.filter(h => h.date !== dateStr);
        } else {
            updatedHolidays = [...localSettings.customHolidays, { date: dateStr, name: 'Día No Laborable', type: 'corporate' as const }];
        }
        handleUpdateSettings('customHolidays', updatedHolidays);
    };

    const finalizeSetup = () => {
        updateSettings({ ...localSettings, setupComplete: true, theme: 'dark' });
        updateData(localData);
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    useEffect(() => {
        if (localSettings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [localSettings.theme]);

    const steps = [
        {
            title: "El Trato",
            subtitle: "Domina tu realidad financiera, empezando hoy.",
            component: (
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-primary-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary-600/40 animate-pulse">
                        <ShieldCheck className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-main uppercase tracking-tighter">Bienvenido a WARDEN</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                            No es solo una app de gastos. Es tu motor de realidad. Aquí tu tiempo es dinero, literalmente.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Tu Tiempo",
            subtitle: "¿Cuánto vale tu hora de vida?",
            component: (
                <div className="space-y-6 max-w-md mx-auto">
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Sueldo Nominal Mensual</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={localData.nominalBaseSalary || ''}
                                onChange={(e) => handleUpdateData('nominalBaseSalary', parseFloat(e.target.value))}
                                className="w-full text-4xl font-black bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-200 dark:placeholder-slate-800"
                                placeholder="0.00"
                            />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2">
                                {(['UYU', 'USD'] as Currency[]).map(curr => (
                                    <button
                                        key={curr}
                                        onClick={() => handleUpdateData('nominalBaseCurrency', curr)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${localData.nominalBaseCurrency === curr ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-white dark:bg-slate-800 text-slate-400'}`}
                                    >
                                        {curr}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                        <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-medium leading-relaxed">
                            Usaremos esto para calcular tu <strong>Valor Hora Real</strong>. Cada vez que gastes, el Guardián te dirá cuántas horas de trabajo te costó.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "El Retén",
            subtitle: "Tu fondo de paz mental futuro.",
            component: (
                <div className="space-y-8 max-w-md mx-auto text-center">
                    <div className="relative pt-10">
                        <div className="text-6xl font-black text-primary-600 mb-2">{localSettings.peaceOfMindPercentage}%</div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            step="5"
                            value={localSettings.peaceOfMindPercentage}
                            onChange={(e) => handleUpdateSettings('peaceOfMindPercentage', parseInt(e.target.value))}
                            className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary-600"
                        />
                        <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Vivir al día</span>
                            <span>Misión Ahorro</span>
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 italic">
                        "Separaremos este % de tus ingresos antes de calcular tu ración diaria. Es dinero que Warden protegerá de ti mismo."
                    </div>
                </div>
            )
        },
        {
            title: "El Guardián",
            subtitle: "¿A quién quieres escuchando tus confesiones?",
            component: (
                <div className="space-y-3 max-w-lg mx-auto">
                    {[
                        { id: 'military', title: 'Militar', desc: 'Estricto. Ideal para salir de crisis. Cero tolerancia.', icon: <Briefcase className="w-5 h-5" /> },
                        { id: 'analytic', title: 'Analítico', desc: 'Foco en métricas. Datos fríos y objetivos.', icon: <Zap className="w-5 h-5" /> },
                        { id: 'colleague', title: 'Colega', desc: 'Motivacional. Refuerzo positivo y equilibrio.', icon: <Bot className="w-5 h-5" /> },
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => handleUpdateSettings('guardianMode', mode.id)}
                            className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${localSettings.guardianMode === mode.id ? 'border-primary-600 bg-primary-600/10 shadow-[0_0_20px_rgba(255,59,48,0.05)]' : 'border-white/5 bg-white/5'}`}
                        >
                            <div className={`p-3 rounded-xl ${localSettings.guardianMode === mode.id ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                                {mode.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-wider">{mode.title}</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{mode.desc}</p>
                            </div>
                            {localSettings.guardianMode === mode.id && <Check className="w-5 h-5 text-primary-600" />}
                        </button>
                    ))}
                </div>
            )
        },
        {
            title: "Blindaje Pro",
            subtitle: "Tus datos financieros, cifrados y bajo llave.",
            component: (
                <div className="space-y-6 max-w-md mx-auto text-center">
                    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <LockIcon className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-main uppercase tracking-tight">Establecer PIN Warden Vault</p>
                        <p className="text-[10px] text-slate-400 font-medium">Recomendado para proteger tu realidad en este dispositivo.</p>
                    </div>

                    <div className="flex justify-center gap-3">
                        <input
                            type="password"
                            maxLength={4}
                            placeholder="PIN (4 dígitos)"
                            value={localSettings.vaultPIN || ''}
                            onChange={(e) => handleUpdateSettings('vaultPIN', e.target.value.replace(/\D/g, ''))}
                            className="w-48 text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xl font-black font-mono tracking-[0.5em] focus:border-primary-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                        <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <p className="text-[9px] text-amber-600 font-bold uppercase leading-tight text-left">
                            Si estableces un PIN, tus datos se cifrarán localmente. No los pierdas.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background transition-colors duration-500 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 dark:opacity-20 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-xl relative p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="bg-surface backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-main p-8 sm:p-12 overflow-hidden flex flex-col min-h-[500px]"
                    >
                        {/* Stepper Progress */}
                        <div className="flex gap-2 mb-10 overflow-hidden">
                            {steps.map((_, i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-100 dark:bg-slate-800'}`} />
                            ))}
                        </div>

                        {/* Content Header */}
                        <div className="mb-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mb-1">Paso {step + 1} de {steps.length}</h3>
                            <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-2">{steps[step].title}</h1>
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{steps[step].subtitle}</p>
                        </div>

                        {/* Step Component */}
                        <div className="flex-1 flex flex-col justify-center">
                            {steps[step].component}
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-12 flex justify-between items-center">
                            <button
                                onClick={prevStep}
                                disabled={step === 0}
                                className={`p-4 rounded-2xl flex items-center justify-center transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>

                            {step < steps.length - 1 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-10 py-5 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-primary-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary-600/30"
                                >
                                    Continuar <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={finalizeSetup}
                                    className="px-10 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-600/30"
                                >
                                    Terminar <Check className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
