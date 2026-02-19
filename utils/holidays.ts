import { Holiday } from '../types';

export const URUGUAY_HOLIDAYS_2024: Holiday[] = [
  { date: '2024-01-01', name: 'Año Nuevo', type: 'national' },
  { date: '2024-01-06', name: 'Día de Reyes', type: 'national' },
  { date: '2024-02-12', name: 'Carnaval', type: 'national' },
  { date: '2024-02-13', name: 'Carnaval', type: 'national' },
  { date: '2024-03-28', name: 'Semana de Turismo', type: 'national' },
  { date: '2024-03-29', name: 'Viernes Santo', type: 'national' },
  { date: '2024-04-19', name: 'Desembarco de los 33', type: 'national' },
  { date: '2024-05-01', name: 'Día del Trabajador', type: 'national' },
  { date: '2024-05-18', name: 'Batalla de las Piedras', type: 'national' },
  { date: '2024-06-19', name: 'Natalicio de Artigas', type: 'national' },
  { date: '2024-07-18', name: 'Jura de la Constitución', type: 'national' },
  { date: '2024-08-25', name: 'Declaratoria de la Independencia', type: 'national' },
  { date: '2024-10-12', name: 'Día de la Raza', type: 'national' },
  { date: '2024-11-02', name: 'Día de los Difuntos', type: 'national' },
  { date: '2024-12-25', name: 'Navidad', type: 'national' },
];

export const getHolidays = (customHolidays: Holiday[] = []): Holiday[] => {
  // Sort by date
  return [...URUGUAY_HOLIDAYS_2024, ...customHolidays].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const isHoliday = (date: Date, holidays: Holiday[]): boolean => {
  const dateString = date.toISOString().split('T')[0];
  return holidays.some(h => h.date === dateString);
};