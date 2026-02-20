import { FinancialData, UserSettings, Debt, GuardianMode } from '../types';

/**
 * Calcula la fecha estimada en que se liquidará una deuda.
 */
export const getDebtFreedomDate = (debt: Debt): string => {
    const remainingInstallments = debt.totalInstallments - debt.paidInstallments;
    if (remainingInstallments <= 0) return 'Liquidada';

    const now = new Date();
    // Sumamos los meses restantes
    now.setMonth(now.getMonth() + remainingInstallments);

    const months = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    return `${months[now.getMonth()]} ${now.getFullYear()}`;
};

/**
 * Simula el impacto de un nuevo gasto recurrente o cuota en el presupuesto diario.
 */
export const calculateSimulationImpact = (
    data: FinancialData,
    settings: UserSettings,
    newMonthlyCommitment: number
) => {
    return {
        impactPerDay: newMonthlyCommitment / 30,
    };
};

/**
 * Genera el veredicto del guardián basado en el impacto y la personalidad configurada.
 */
export const getSimulationVerdict = (
    dailyImpact: number,
    dailyBudget: number,
    guardianMode: GuardianMode
): string => {
    // Si el presupuesto diario es 0 o negativo, cualquier impacto es crítico
    const safeDailyBudget = dailyBudget > 0 ? dailyBudget : 1000;
    const impactPercent = (dailyImpact / safeDailyBudget) * 100;

    if (guardianMode === 'military') {
        if (impactPercent > 20) return `ESTO ES UN SUICIDIO FINANCIERO. Drenarás el ${impactPercent.toFixed(1)}% de tu munición diaria. Abandona la misión inmediatamente.`;
        if (impactPercent > 10) return `ESTÁS COMPROMETIENDO LA ESTRATEGIA. Reducción del ${impactPercent.toFixed(1)}% en capacidad operativa. Solo procede si es vital para la supervivencia.`;
        return `Impacto contenido (${impactPercent.toFixed(1)}%). El flujo puede absorberlo, pero no te ablandes. Mantén la disciplina.`;
    } else if (guardianMode === 'colleague') {
        if (impactPercent > 20) return `¡Cuidado, amigo! Esto se lleva el ${impactPercent.toFixed(1)}% de lo que tienes para gastar cada día. Piénsalo dos veces, tu paz mental vale más que un impulso.`;
        if (impactPercent > 10) return `Es un gasto considerable (${impactPercent.toFixed(1)}% de tu día). Te sugiero esperar 24 horas antes de decidir. ¡Tú puedes con el ahorro!`;
        return `Impacto leve (${impactPercent.toFixed(1)}%). Parece una buena decisión si te hace feliz, ¡tu presupuesto lo permite sin drama!`;
    } else {
        // Analytic mode
        if (impactPercent > 20) return `Análisis de Riesgo: Crítico. Impacto del ${impactPercent.toFixed(1)}% sobre el flujo diario disponible. Recomendación: Diferir o cancelar para evitar insolvencia transitoria.`;
        if (impactPercent > 10) return `Alerta de Eficiencia: Desviación del ${impactPercent.toFixed(1)}% detectada. El ROI emocional debe ser excepcionalmente alto para justificar este drenaje.`;
        return `Parámetros Nominales: Impacto del ${impactPercent.toFixed(1)}%. El sistema permanece estable. Ejecución autorizada bajo monitoreo.`;
    }
};

/**
 * Genera puntos de datos para comparar la trayectoria actual vs simulada.
 */
export const getSimulationPoints = (
    dailyBudget: number,
    dailyImpact: number,
    daysInMonth: number
) => {
    const points: { day: number, current: number, simulated: number }[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
        points.push({
            day: i,
            current: dailyBudget * i,
            simulated: (dailyBudget - dailyImpact) * i
        });
    }

    return points;
};
