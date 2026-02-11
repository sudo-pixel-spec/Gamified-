"use client";
import { useState } from "react";

interface StreakProps {
  activeDays: number[]; // For simplicity, current month days
}

export const StreakCalendar = ({ activeDays }: StreakProps) => {
  const [viewDate, setViewDate] = useState(new Date(2026, 1, 1)); // Starts at Feb 2026

  // Logic to get month name and days in that month
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();
  
  // Calculate total days in the current viewing month
  const daysInMonth = new Date(year, viewDate.getMonth() + 1, 0).getDate();

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  return (
    <div className="bg-[#9499a3] p-8 rounded-[2.5rem] shadow-xl w-full max-w-md mx-auto transition-all duration-500">
      {/* Month Navigation Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => changeMonth(-1)}
          className="text-white/50 hover:text-white transition-colors"
        >
          ←
        </button>
        <div className="text-center">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-100/80">
            Streak Calendar
          </h4>
          <p className="text-white font-bold text-sm">{monthName} {year}</p>
        </div>
        <button 
          onClick={() => changeMonth(1)}
          className="text-white/50 hover:text-white transition-colors"
        >
          →
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          // Note: In a real app, you'd check activeDays for the specific month/year
          const active = activeDays.includes(day) && viewDate.getMonth() === 1;
          
          return (
            <div 
              key={day} 
              className={`
                aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300
                ${active 
                  ? 'bg-orange-300/30 border-2 border-[#FF7D29] text-white shadow-[0_0_15px_rgba(255,125,41,0.5)] scale-110' 
                  : 'bg-slate-800/20 text-slate-300/50 hover:bg-slate-800/40'
                }
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 py-3 bg-white/5 border border-white/5 rounded-2xl text-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
          {activeDays.length} Streaks in {monthName}
        </p>
      </div>
    </div>
  );
};