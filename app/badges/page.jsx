"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiFetch } from "../../lib/api";
import { BADGE_DEFINITIONS, getBadgeDetails } from "../../lib/badges";
import Link from "next/link";

export default function BadgesPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    apiFetch("/v1/me").then(res => {
      setMe(res?.data || res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [authLoading]);

  const earnedBadgeIds = useMemo(() => new Set(me?.badges || []), [me]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Premium Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
            <Link href="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
              <span className="material-symbols-rounded text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span className="text-xs font-black uppercase tracking-widest">Back to Dash</span>
            </Link>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <span className="material-symbols-rounded text-primary text-sm">stars</span>
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">
                  {earnedBadgeIds.size} / {Object.keys(BADGE_DEFINITIONS).length} Badges Earned
                </span>
            </div>
        </div>

        <div className="max-w-3xl mb-16">
          <h1 className="text-5xl font-display font-black mb-4 text-white tracking-tight">MY <span className="text-primary italic">TROPHY</span> ROOM</h1>
          <p className="text-lg text-white/50 leading-relaxed font-medium">Your achievements, immortalized. Each badge represents a milestone in your cosmic learning journey. Keep soaring to unlock them all.</p>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(BADGE_DEFINITIONS).map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            return (
              <div 
                key={badge.id}
                className={`group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${
                  isEarned 
                    ? `bg-white/5 border-white/10 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]` 
                    : "bg-black/40 border-white/5 grayscale opacity-50 backdrop-blur-sm"
                }`}
              >
                {/* Glow layer for earned badges */}
                {isEarned && (
                  <div className={`absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-10 rounded-full blur-[60px] transition-opacity duration-700`}></div>
                )}
                
                {/* Badge Icon Shield */}
                <div className={`relative z-10 w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-full border-2 transition-transform duration-500 group-hover:scale-110 ${
                    isEarned 
                      ? `bg-gradient-to-tr ${badge.color} p-0.5 ${badge.shadow} shadow-2xl`
                      : "bg-white/5 border-white/10"
                }`}>
                  <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                    <span className={`material-symbols-rounded text-4xl ${isEarned ? badge.iconColor : 'text-white/10'}`}>
                      {isEarned ? badge.icon : 'lock'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  <h3 className={`text-xl font-display font-bold mb-3 tracking-wide ${isEarned ? 'text-white' : 'text-white/20'}`}>
                    {badge.name}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isEarned ? 'text-white/50' : 'text-white/10 italic'}`}>
                    {badge.description}
                  </p>

                  <div className="mt-8 flex justify-center">
                    {isEarned ? (
                      <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-[9px] font-black uppercase text-primary tracking-[0.2em] animate-pulse">
                        Unlocked
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase text-white/20 tracking-[0.2em]">
                        Locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Shimmer effect for earned badges on hover */}
                {isEarned && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1500ms] pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info/call-to-action */}
        <div className="mt-24 p-12 text-center bg-white/5 border border-white/10 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-transform group-hover:scale-110">
                  <span className="material-symbols-rounded text-white/30 text-3xl">auto_fix_high</span>
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Want more badges?</h3>
              <p className="text-white/40 max-w-sm mx-auto mb-8 text-sm">Our cosmic academy rewards curiosity. Take more quizzes, maintain your streak, and masters difficult subjects to fill your trophy room.</p>
              <Link href="/subjects" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
                Continue Learning
                <span className="material-symbols-rounded text-sm">rocket_launch</span>
              </Link>
            </div>
        </div>

      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
      `}</style>
    </div>
  );
}
