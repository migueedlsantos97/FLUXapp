import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Holiday } from '../../types';

interface CalendarProps {
  selectedDates: Holiday[];
  onToggleDate: (date: string) => void;
  nationalHolidays: Holiday[];
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDates, onToggleDate, nationalHolidays }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Adjust so Monday is 0, Sunday is 6
  let firstDayOfMonth = new Date(year, month, 1).getDay() - 1;
  if (firstDayOfMonth === -1) firstDayOfMonth = 6;

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isSelected = (dateStr: string) => selectedDates.some(h => h.date === dateStr);
  const isNational = (dateStr: string) => nationalHolidays.some(h => h.date === dateStr);

  const renderDays = () => {
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const selected = isSelected(dateStr);
      const national = isNational(dateStr);

      let bgClass = "bg-surface text-main hover:bg-white/5";
      let ringClass = "";

      if (selected) {
        bgClass = "bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-md transform scale-105";
      } else if (national) {
        bgClass = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
      }

      // Today indicator
      const today = new Date();
      const isToday = today.toISOString().split('T')[0] === dateStr;
      if (isToday && !selected) {
        ringClass = "ring-2 ring-primary-200 dark:ring-primary-900";
      }

      days.push(
        <button
          key={d}
          onClick={() => onToggleDate(dateStr)}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${bgClass} ${ringClass}`}
          title={national ? "Feriado Nacional" : "Click para marcar/desmarcar"}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-surface rounded-xl border border-main shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
        <button onClick={prevMonth} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <span className="font-bold text-slate-800 dark:text-slate-200 text-lg capitalize">
          {monthNames[month]} {year}
        </span>
        <button onClick={nextMonth} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
            <div key={day} className="text-xs font-semibold text-slate-400 uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 justify-items-center">
          {renderDays()}
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary-600"></div>
          <span className="text-slate-600 dark:text-slate-400">No Laborable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-200"></div>
          <span className="text-slate-600 dark:text-slate-400">Nacional</span>
        </div>
      </div>
    </div>
  );
};