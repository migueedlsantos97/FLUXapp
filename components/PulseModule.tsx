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
        <div className="bg-surface border border-main rounded-3xl p-6 shadow-sm relative group">
            {/* Header Pro */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full ${currentStatus ? 'bg-sentry-active' : 'bg-sentry-liberate'}`} />
                    <div>
                        <h3 className="text-base font-black text-main leading-none uppercase tracking-tighter">Warden Pulse</h3>
                        <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-widest">Auditoría Semanal</p>
                    </div>
                </div>

                {dayZero && (
                    <div className={`px-3 py-1.5 rounded-xl border ${dayZero.isCritical ? 'bg-sentry-active/10 border-sentry-active/30' : 'bg-background/50 border-main'}`}>
                        <span className="text-[9px] font-black text-muted uppercase tracking-tight mr-2">Día Cero:</span>
                        <span className={`text-xs font-black uppercase ${dayZero.isCritical ? 'text-sentry-active' : 'text-sentry-liberate'}`}>
                            {dayZero.day === daysInMonth && !dayZero.isCritical ? 'A Salvo' : `Día ${dayZero.day}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Gráfico Recharts - Estilo Semanal (L-D) */}
            <div className="h-52 w-full mt-4 bg-background/30 rounded-xl p-2 overflow-hidden relative border border-main/20">
                {!isMounted ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-sentry-liberate/10 border-t-sentry-liberate rounded-full animate-spin" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <defs>
                                <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="100%">
                                    <stop offset="5%" stopColor={currentStatus ? "#ff3b30" : "#34c759"} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={currentStatus ? "#ff3b30" : "#34c759"} stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--main)" opacity={0.05} />

                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'var(--muted)', fontWeight: 900 }}
                                interval={0}
                            />

                            <YAxis hide domain={[0, data.initialDisposable * 1.05]} />

                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--surface)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--main)',
                                    fontSize: '11px',
                                    fontWeight: '900',
                                    textTransform: 'uppercase'
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
                                stroke="var(--main)"
                                strokeWidth={1}
                                strokeDasharray="6 6"
                                opacity={0.3}
                                dot={false}
                                activeDot={false}
                            />

                            {/* Gasto Real (Sólido) */}
                            <Area
                                type="monotone"
                                dataKey="gasto"
                                stroke={currentStatus ? "var(--sentry-active)" : "var(--sentry-liberate)"}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorGasto)"
                                animationDuration={1500}
                                dot={{ r: 3, fill: currentStatus ? "var(--sentry-active)" : "var(--sentry-liberate)", strokeWidth: 0 }}
                                activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--main)' }}
                                connectNulls={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Footer de Datos */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-main/10">
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted tracking-widest">Ahorro Estimado</p>
                    <p className={`text-lg font-black font-mono leading-none ${data.remaining < 0 ? 'text-sentry-active' : 'text-main'}`}>
                        {formatMoney(data.remaining)}
                    </p>
                </div>

                <div className="text-right space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted tracking-widest">Media Diaria</p>
                    <p className={`text-lg font-black font-mono leading-none ${currentStatus ? 'text-sentry-active' : 'text-sentry-liberate'}`}>
                        {formatMoney(data.currentSpent / (currentDay || 1))}
                    </p>
                </div>
            </div>
        </div>
    );
};
