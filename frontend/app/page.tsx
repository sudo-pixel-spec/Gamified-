"use client";
import { useState } from "react";
import { MissionCard } from "../components/MissionCard";
import { StreakCalendar } from "../components/StreakCalendar";

export default function Dashboard() {
  // 1. Mission State
  const [missions, setMissions] = useState([
    {
      id: 1,
      stepNumber: "01",
      title: "Interstellar Math",
      description: "Master the calculations of orbital mechanics and cosmic constants through 15 challenging modules.",
      progress: 25,
      isRecommended: false
    },
    {
      id: 2,
      stepNumber: "02",
      title: "Galactic Science",
      description: "Explore the biology of alien lifeforms and the chemistry of distant gas giant atmospheres.",
      progress: 88,
      isRecommended: true
    },
    {
      id: 3,
      stepNumber: "03",
      title: "Cosmic History",
      description: "Uncover the ancient civilizations of the Milky Way and the major events of the Great Expansion.",
      progress: 32,
      isRecommended: false
    }
  ]);

  // 2. Dynamic Streak State
  const [activeDays, setActiveDays] = useState([1, 2, 3, 10, 11, 12]);
  const userStats = { streak: activeDays.length, xp: 2450, level: 14 };

  // 3. Function to update progress AND calendar dynamically
  const handleStudy = (id: number) => {
    // Update Mission Progress
    setMissions(prev => 
      prev.map(m => m.id === id ? { ...m, progress: Math.min(m.progress + 10, 100) } : m)
    );

    // Record today's date in calendar (simulating day 13 for this example)
    const today = 13; 
    if (!activeDays.includes(today)) {
      setActiveDays(prev => [...prev, today].sort((a, b) => a - b));
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans">
      <header className="max-w-7xl mx-auto p-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FF7D29] rounded-xl shadow-sm" />
          <span className="font-black text-2xl tracking-tighter italic text-slate-900">Gamefied</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 bg-white/80 backdrop-blur-sm p-2 px-4 rounded-2xl shadow-sm border border-orange-100">
          <div className="bg-orange-50 px-4 py-2 rounded-xl text-[#FF7D29] font-bold text-sm">
            🔥 {userStats.streak} Day Streak
          </div>
          <div className="hidden sm:block">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1 gap-4">
              <span>Level {userStats.level} Explorer</span>
              <span>{userStats.xp} / 3,000 XP</span>
            </div>
            <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-[#FF7D29] h-full rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-20">
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Choose Your Mission</h1>
          <p className="text-slate-500 max-w-xl mx-auto mb-16 leading-relaxed">
            Continue your learning journey and maintain your daily streak to earn bonus XP.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {missions.map((mission) => (
              <MissionCard 
                key={mission.id}
                stepNumber={mission.stepNumber}
                title={mission.title}
                description={mission.description}
                progress={mission.progress}
                isRecommended={mission.isRecommended}
                onStudy={() => handleStudy(mission.id)} 
              />
            ))}
          </div>
        </section>

        <section className="bg-white/60 backdrop-blur-md border border-white rounded-[3rem] p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center shadow-xl shadow-orange-100/50">
          <div className="space-y-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              Building Habits:<br/>Your Streak Journey
            </h2>
            <div className="space-y-10">
              <HabitPoint n="1" t="Daily Learning Streaks" d="Encourages consistent engagement, turning learning into a daily cosmic habit." />
              <HabitPoint n="2" t="XP & Level Progression" d="Experience points (XP) provide visible indicators of your intellectual advancement." />
              <HabitPoint n="3" t="Consistency Rewards" d="Special bonuses and legendary equipment for maintaining streaks over time." />
            </div>
          </div>
          <div className="flex justify-center w-full">
            {/* Calendar now receives dynamic activeDays state */}
            <StreakCalendar activeDays={activeDays} />
          </div>
        </section>
      </main>
    </div>
  );
}

const HabitPoint = ({ n, t, d }: { n: string, t: string, d: string }) => (
  <div className="flex gap-6">
    <div className="w-10 h-10 rounded-full bg-[#FF7D29] text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-orange-200 text-sm">
      {n}
    </div>
    <div>
      <h4 className="font-bold text-lg text-slate-800 mb-1">{t}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{d}</p>
    </div>
  </div>
);