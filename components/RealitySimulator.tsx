import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Calculator, Zap, ArrowRight, ShieldCheck, X, TrendingDown, Info } from 'lucide-react';
import { getSimulationVerdict, getSimulationPoints } from '../utils/simulation';
import { calculateDailyBudget, calculatePulseData } from '../utils/finance';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

export const RealitySimulator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { data, settings } = useStore();
    const [amount, setAmount] = useState('');
    const [installments, setInstallments] = useState('1');
    const [isChartOpen, setIsChartOpen] = useState(false);

    const simulate = () => {
        const amt = parseFloat(amount) || 0;
        const inst = parseInt(installments) || 1;
        const monthlyPayment = amt / inst;
        const dailyImpact = monthlyPayment / 30;

        return { monthlyPayment, dailyImpact };
    };

    const result = simulate();
    const pulse = calculatePulseData(data, settings, 30, new Date().getDate());
    const dailyBudget = pulse.initialDisposable / 30;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fade-in">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 border border-white/20"
            >
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none">Proyector de Realidad</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    <Input
                        label="Monto de la Inversión/Gasto"
                        placeholder="Ej. 1200"
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Plazo (Cuotas)"
                            placeholder="Ej. 12"
                            type="number"
                            value={installments}
                            onChange={e => setInstallments(e.target.value)}
                        />
                        <div className="flex flex-col justify-end pb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Frecuencia</span>
                            <div className="h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center px-4 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                                Mensual
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Impacto Proyectado</h4>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Costo Mensual</span>
                                <span className="font-black text-slate-800 dark:text-white">
                                    {new Intl.NumberFormat('es-UY', { style: 'currency', currency: settings.baseCurrency }).format(result.monthlyPayment)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Drenaje Diario (Pulso)</span>
                                <span className="font-black text-red-500">
                                    -{new Intl.NumberFormat('es-UY', { style: 'currency', currency: settings.baseCurrency }).format(result.dailyImpact)}
                                </span>
                            </div>
                        </div>

                        {isChartOpen && (
                            <div className="mt-6 h-48 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                                <h5 className="text-[9px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" /> Proyección de Liquidez Diaria
                                </h5>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={getSimulationPoints(dailyBudget, result.dailyImpact, 30)}>
                                        <defs>
                                            <linearGradient id="colorCur" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                        <XAxis hide dataKey="day" />
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', padding: '8px' }}
                                            formatter={(val: number) => [new Intl.NumberFormat('es-UY').format(val), '']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="current"
                                            stroke="#6366f1"
                                            fillOpacity={1}
                                            fill="url(#colorCur)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="simulated"
                                            stroke="#f43f5e"
                                            strokeDasharray="4 4"
                                            fillOpacity={1}
                                            fill="url(#colorSim)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-start gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                                <strong className="text-slate-700 dark:text-slate-200 uppercase tracking-tighter">VEREDICTO DEL GUARDIÁN: </strong>
                                {getSimulationVerdict(result.dailyImpact, dailyBudget, settings.guardianMode)}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsChartOpen(!isChartOpen)}
                        className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 transition-all ${isChartOpen ? 'bg-slate-800 text-white' : ''}`}
                    >
                        {isChartOpen ? 'Ocultar Gráfico' : 'Ver Simulación en Gráfico'}
                        <ArrowRight className={`w-4 h-4 transition-transform ${isChartOpen ? 'rotate-90' : ''}`} />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
