import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { AlertCircle } from 'lucide-react'; // Placeholder if needed, but actually can remove all if unused

interface PulsePoint {
    day: number;
    spent: number;
    ideal: number;
}

interface PulseModuleProps {
    data: {
        initialDisposable: number;
        burnPoints: PulsePoint[];
        currentSpent: number;
        remaining: number;
    };
    daysInMonth: number;
    currentDay: number;
    formatMoney: (amount: number) => string;
    dayZero: { day: number, isCritical: boolean } | null;
}

export const PulseModule: React.FC<PulseModuleProps> = ({ data, daysInMonth, currentDay, formatMoney, dayZero }) => {
    // Estado para manejar el montaje y evitar warnings de ResponsiveContainer
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Etiquetas de días de la semana (L, M, M, J, V, S, D)
    const weekLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    // Obtenemos el índice del día actual (Lunes=0, ..., Domingo=6)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const currentWeekIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // El inicio de esta semana (Lunes) relativo al día actual
    const weekStart = currentDay - currentWeekIdx;

    // Generamos datos para los 7 días de la semana (Vista Semanal)
    const chartData = weekLabels.map((label, idx) => {
        const targetDay = weekStart + idx;

        // CORRECCIÓN: Manejar días fuera del rango del mes actual
        // Si targetDay <= 0, es el mes pasado. Si targetDay > daysInMonth, es el mes que viene.
        const point = (targetDay > 0 && targetDay <= daysInMonth)
            ? data.burnPoints.find(p => p.day === targetDay)
            : null;

        // Lógica de Gasto: Solo mostrar si es el presente o pasado del mes actual
        const gastoValue = (targetDay > 0 && targetDay <= currentDay && point) ? point.spent : null;

        // Lógica de Ideal: Proyectar línea ideal incluso si el día es fuera de rango (para continuidad visual)
        const idealDaily = data.initialDisposable / daysInMonth;
        const idealValue = point ? point.ideal : idealDaily * Math.max(0, targetDay);

        return {
            name: label,
            gasto: gastoValue,
            ideal: idealValue,
            dia: targetDay,
            isOffMonth: targetDay <= 0 || targetDay > daysInMonth
        };
    });

    // Valor del presupuesto ideal diario para el cálculo de salud
    const idealDaily = data.initialDisposable / daysInMonth;
    const currentStatus = (data.currentSpent / (currentDay || 1)) > idealDaily;

    return (
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative group">
            {/* Header Pro */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full ${currentStatus ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white leading-none">Flux Pulse</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">Auditoría Semanal</p>
                    </div>
                </div>

                {dayZero && (
                    <div className={`px-3 py-1.5 rounded-xl border ${dayZero.isCritical ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mr-2">Día Cero:</span>
                        <span className={`text-xs font-black uppercase ${dayZero.isCritical ? 'text-red-500' : 'text-emerald-500'}`}>
                            {dayZero.day === daysInMonth && !dayZero.isCritical ? 'A Salvo' : `Día ${dayZero.day}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Gráfico Recharts - Estilo Semanal (L-D) */}
            <div className="h-52 w-full mt-4 bg-slate-50/10 dark:bg-slate-900/5 rounded-xl p-2 overflow-hidden relative">
                {!isMounted ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <defs>
                                <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="100%">
                                    <stop offset="5%" stopColor={currentStatus ? "#ef4444" : "#10b981"} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={currentStatus ? "#ef4444" : "#10b981"} stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />

                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                                interval={0}
                            />

                            <YAxis hide domain={[0, data.initialDisposable * 1.05]} />

                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }}
                                formatter={(value: number) => [formatMoney(value), 'Gasto']}
                                labelFormatter={(label, payload) => {
                                    if (payload && payload[0]) {
                                        const { dia, isOffMonth } = payload[0].payload;
                                        if (isOffMonth) return `Fuera de ciclo (${label})`;
                                        return `Día ${dia} (${label})`;
                                    }
                                    return label;
                                }}
                            />

                            {/* Línea Ideal / Forecast (Punteada con mayor visibilidad) */}
                            <Line
                                type="monotone"
                                dataKey="ideal"
                                stroke="#94a3b8"
                                strokeWidth={1.5}
                                strokeDasharray="4 4"
                                opacity={0.6}
                                dot={false}
                                activeDot={false}
                            />

                            {/* Gasto Real (Sólido) */}
                            <Area
                                type="monotone"
                                dataKey="gasto"
                                stroke={currentStatus ? "#ef4444" : "#10b981"}
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorGasto)"
                                animationDuration={1500}
                                dot={{ r: 2, fill: currentStatus ? "#ef4444" : "#10b981" }}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                                connectNulls={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Footer de Datos */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50 dark:border-slate-900">
                <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Ahorro Estimado</p>
                    <p className={`text-lg font-black font-mono leading-none ${data.remaining < 0 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                        {formatMoney(data.remaining)}
                    </p>
                </div>

                <div className="text-right space-y-1">
                    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Media Diaria</p>
                    <p className={`text-lg font-black font-mono leading-none ${currentStatus ? 'text-red-500' : 'text-emerald-500'}`}>
                        {formatMoney(data.currentSpent / (currentDay || 1))}
                    </p>
                </div>
            </div>
        </div>
    );
};
