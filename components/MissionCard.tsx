"use client";
import Link from "next/link";

interface MissionProps {
  id: number; // Added to create dynamic links like /missions/1
  title: string;
  description: string;
  progress: number;
  stepNumber: string;
  isRecommended?: boolean;
  onStudy?: () => void;
}

export const MissionCard = ({ 
  id,
  title, 
  description, 
  progress, 
  stepNumber, 
  isRecommended = false,
  onStudy 
}: MissionProps) => {
  return (
    <div className={`
      relative p-8 rounded-[2.5rem] border transition-all duration-500 
      flex flex-col h-full group hover:-translate-y-3
      ${isRecommended 
        ? 'bg-white/90 border-orange-200 shadow-2xl shadow-orange-100 scale-105 z-10' 
        : 'bg-white/70 border-white shadow-xl hover:bg-white'
      }
    `}>
      <div className="absolute top-4 right-8 text-7xl font-black text-slate-100 opacity-40 select-none group-hover:opacity-60 transition-opacity">
        {stepNumber}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {isRecommended && (
          <div className="bg-[#FF7D29] text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-tighter">
            Recommended
          </div>
        )}

        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-8 flex-grow leading-relaxed">
          {description}
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isRecommended ? 'bg-[#FF7D29]' : 'bg-[#6366F1]'
              }`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* Updated: This now acts as a link to your units page */}
        <Link 
          href={`/missions/${id}`} 
          onClick={onStudy}
          className="w-full py-4 bg-[#FF7D29] hover:bg-[#E86C1D] text-center text-white font-bold rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 block"
        >
          Continue Mission
        </Link>
      </div>
    </div>
  );
};