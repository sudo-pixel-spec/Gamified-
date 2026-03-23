"use client";

import React, { useState, useEffect } from "react";

const grades = [
  { id: 5, label: "Grade 5", rank: "Junior Cadet", icon: "rocket_launch" },
  { id: 6, label: "Grade 6", rank: "Explorer", icon: "language" },
  { id: 7, label: "Grade 7", rank: "Voyager", icon: "public" },
  { id: 8, label: "Grade 8", rank: "Commander", icon: "auto_awesome" },
  { id: 9, label: "Grade 9", rank: "Navigator", icon: "star_border" },
  { id: 10, label: "Grade 10", rank: "Supernova", icon: "brightness_high" },
];

export default function GradeSelection() {
  const [selectedGrade, setSelectedGrade] = useState(5);

  // Make sure dark mode class is applied to <html>
  useEffect(() => {
    document.documentElement.classList.add("dark"); // force dark mode for testing
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans relative">

      {/* STAR BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="star-field absolute inset-0"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-orange-900/10 rounded-full blur-3xl"></div>
      </div>

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        .star-field {
          background-image: 
            radial-gradient(1px 1px at 20px 30px, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255, 255, 255, 0.5), transparent),
            radial-gradient(1.5px 1.5px at 150px 200px, rgba(255, 255, 255, 0.6), transparent),
            radial-gradient(1px 1px at 250px 10px, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(2px 2px at 300px 150px, rgba(255, 255, 255, 0.4), transparent);
          background-size: 400px 400px;
          background-color: transparent;
        }
        .grade-card:hover .grade-icon {
          transform: translateY(-8px) rotate(5deg);
        }
      `}</style>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col min-h-screen">

        {/* HEADER */}
        <header className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 mt-8">Launch your learning journey</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            Select your current grade to customize your cosmic curriculum and start building your streak.
          </p>
        </header>

        {/* GRADE CARDS */}
        <main className="flex-grow space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {grades.map((grade) => (
              <label key={grade.id} className="group cursor-pointer w-full">
                <input 
                  type="radio" 
                  name="grade" 
                  className="hidden" 
                  checked={selectedGrade === grade.id}
                  onChange={() => setSelectedGrade(grade.id)}
                />
                <div className={`grade-card w-full p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all duration-300
                  ${selectedGrade === grade.id
                    ? "border-[#f97316] bg-[#f97316]/10 shadow-lg"
                    : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/80 hover:border-[#f97316]/50"
                  }`}
                >
                  <div className="grade-icon w-20 h-20 mb-4 rounded-2xl flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-[#f97316] transition-transform duration-300">
                    <span className="material-icons-round text-5xl">{grade.icon}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold dark:text-white">{grade.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 uppercase tracking-widest font-semibold">{grade.rank}</p>
                </div>
              </label>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}