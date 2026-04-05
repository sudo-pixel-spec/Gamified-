"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

export default function EventBanner() {
  const router = useRouter();
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await apiFetch("/v1/events").catch(() => null);
      if (res?.data && res.data.length > 0) {
        const now = new Date();
        const valid = res.data.find(ev => 
            new Date(ev.startDate) <= now && 
            new Date(ev.endDate) > now &&
            ev.status === "published"
        );
        setActiveEvent(valid);
      } else {
        // No active events found in DB
        setActiveEvent(null);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) return null;

  // ── RENDER EVENT ───────────────────────────────────────────────────────────
  if (activeEvent) {
    const timeLeft = Math.max(0, new Date(activeEvent.endDate) - Date.now());
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);

    return (
      <div className="w-full relative group mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-orange-500/20 to-primary/30 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
          <div className="relative bg-[#141414] border border-orange-500/30 rounded-[3rem] p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-primary/10">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                  <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(255,107,0,0.6)]">
                      <span className="material-symbols-outlined text-white text-4xl">celebration</span>
                  </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                      <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.3em]">Active Protocol</span>
                      <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Ends in {daysLeft > 0 ? `${daysLeft} days` : `${hoursLeft} hours`}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-black uppercase italic text-white tracking-widest mb-3 leading-none drop-shadow-md">
                      {activeEvent.title}
                  </h2>
                  <p className="text-white/60 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                      {activeEvent.description}
                  </p>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                  <button 
                    onClick={() => router.push('/subjects')}
                    className="w-full md:w-auto px-10 py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 border-b-[8px] border-orange-700"
                  >
                      Deploy to Mission
                  </button>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rotate-45 border border-white/10 pointer-events-none"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rotate-45 border border-white/10 pointer-events-none"></div>
          </div>
          <style jsx global>{`
             @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
             .font-display { font-family: 'Syne', sans-serif; }
          `}</style>
      </div>
    );
  }

  // ── RENDER COMING SOON ─────────────────────────────────────────────────────
  return (
    <div className="w-full relative group mb-12">
        <div className="relative bg-[#141414] border border-white/5 rounded-[3rem] p-8 md:p-10 overflow-hidden flex flex-col md:flex-row items-center gap-10 shadow-2xl">
            
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center grayscale opacity-40">
                <div className="relative w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-white/40 text-4xl">event_upcoming</span>
                </div>
            </div>

            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Quiet Phase</span>
                    <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Next event loading...</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-black uppercase text-white/80 tracking-widest mb-4 leading-none">
                    Events <span className="text-white/20 italic">Coming Soon</span>
                </h2>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 opacity-30">
                    {[
                      { icon: "military_tech", label: "Global Tournament" },
                      { icon: "auto_stories",  label: "New Subjects" },
                      { icon: "hotel_class",   label: "Badge Season 2" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-sm">{item.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                      </div>
                    ))}
                </div>
            </div>

            <div className="shrink-0 w-full md:w-64 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-2">Internal Roadmap</p>
                <div className="space-y-3">
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 w-2/3"></div>
                  </div>
                  <p className="text-[10px] text-white/40 font-medium leading-relaxed">System engineers are preparing new curriculum missions. Stay tuned for the next campaign.</p>
                </div>
            </div>
        </div>
        
        <style jsx global>{`
           @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
           .font-display { font-family: 'Syne', sans-serif; }
        `}</style>
    </div>
  );
}
