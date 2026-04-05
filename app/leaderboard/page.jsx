"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getToken, apiFetch } from "../../lib/api";
import { useRequireAuth } from "../../hooks/useRequireAuth";

// ── Configuration ──────────────────────────────────────────────────────────
const MILESTONES = [
  { icon: "hotel_class",          title: "Supernova",     desc: "Reach Level 50" },
  { icon: "local_fire_department", title: "Comet Streak", desc: "30 Day Consistency" },
  { icon: "diamond",              title: "XP Miner",      desc: "Earn 50k Total XP" },
  { icon: "groups",               title: "Squad Leader",  desc: "Top 10 in Season" },
];

function pctColor(pct) {
  const p = Math.round((pct || 0) * 100);
  if (p >= 90) return "text-primary shadow-[0_0_8px_rgba(255,107,0,0.4)]";
  if (p >= 75) return "text-orange-400";
  if (p >= 50) return "text-orange-600";
  return "text-white/40";
}

const AVATAR_COLORS = [
  "bg-primary/20 text-primary border-primary/30",
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/20 text-amber-400 border-amber-500/30",
];

function avatarStyle(userId) {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function shortId(userId) {
  return userId.slice(-6).toUpperCase();
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useRequireAuth();
  const [tab,      setTab]      = useState("weekly");
  const [weekly,   setWeekly]   = useState([]);
  const [mastery,  setMastery]  = useState([]);
  const [meHome,   setMeHome]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (authLoading) return;
    const token = getToken();
    if (!token) { router.replace("/login"); return; }

    setLoading(true);
    setError("");

    Promise.allSettled([
      apiFetch(`/v1/leaderboards/weekly-growth`),
      apiFetch(`/v1/leaderboards/mastery`),
      apiFetch(`/v1/dashboard/home`).catch(() => null)
    ]).then(([wRes, mRes, hRes]) => {
      const wRaw = wRes.status === 'fulfilled' ? (wRes.value?.data?.entries || wRes.value?.entries || []) : [];
      const mRaw = mRes.status === 'fulfilled' ? (mRes.value?.data?.entries || mRes.value?.entries || []) : [];
      const hRaw = hRes.status === 'fulfilled' ? (hRes.value?.data || hRes.value) : null;

      setWeekly(wRaw.map((e, i) => ({ ...e, rank: i + 1 })));
      setMastery(mRaw.map((e, i) => ({ ...e, rank: i + 1 })));
      setMeHome(hRaw);

      if (!wRaw.length && !mRaw.length) {
        setError("No rankings available yet this week. Complete some quizzes to join the battle!");
      }
    }).catch(err => {
      setError("Strategic data recovery failed.");
      console.error(err);
    }).finally(() => setLoading(false));
  }, [authLoading, router]);

  const rows = tab === "weekly" ? weekly : mastery;
  const myId = authUser?._id || authUser?.id;
  const myName = authUser?.profile?.fullName?.split(" ")[0] || "You";

  // Robust Completion Calculation (Same as Analytics)
  const completedSet = useMemo(() => {
    const set = new Set();
    // 1. From User Object
    if (authUser?.profile?.completedLessons) {
      authUser.profile.completedLessons.forEach(id => set.add(String(id)));
    }
    // 2. From Home Progress (raw history)
    if (meHome?.completedLessons) {
      meHome.completedLessons.forEach(l => set.add(String(l._id || l)));
    }
    return set;
  }, [authUser, meHome]);

  const verifiedRows = useMemo(() => {
    // Calculate verified chapters for YOU
    const uniqueChapters = new Set();
    if (meHome?.completedLessons) {
      meHome.completedLessons.forEach(l => {
        if (l.chapterId) uniqueChapters.add(String(l.chapterId));
      });
    }

    return rows.map(row => {
      if (row.userId === myId) {
        return {
          ...row,
          lessonsCompleted: completedSet.size,
          chaptersCompleted: uniqueChapters.size,
          // Mastery tab shows chaptersCompleted for YOU
        };
      }
      return row;
    });
  }, [rows, myId, completedSet.size, meHome]);

  const myRank = verifiedRows.find(r => r.userId === myId)?.rank ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,107,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,107,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
        </div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(255,107,0,0.2)]" />
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Rankings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary selection:text-white">
      {/* Background HUD effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,107,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,107,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32 relative z-10">

        {/* ── Header Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-rounded text-primary animate-pulse text-xl">leaderboard</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Live Simulation / Global Grid</span>
            </div>
            <h1 className="text-5xl font-display font-black text-white leading-tight tracking-tight uppercase">
              Global <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary animate-shine bg-[length:200%_auto]">Rankings</span>
            </h1>
            <p className="text-white/40 text-sm italic mt-2 font-medium max-w-xl">Synchronizing combat data across all sectors. High-performance cadets are highlighted in the tactical grid.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="glass-card glow-orange p-5 rounded-2xl border-white/5 bg-white/[0.02] flex flex-col justify-center">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 opacity-60">Total Players</p>
                <p className="text-3xl font-display font-black text-white italic">{rows.length}</p>
             </div>
             {myRank && (
              <div className="glass-card glow-orange p-5 rounded-2xl border-primary/30 ring-1 ring-white/10 bg-primary/5 flex flex-col justify-center">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Your Sector</p>
                 <p className="text-3xl font-display font-black text-white italic">#{myRank}</p>
              </div>
             )}
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
          {[
            ["weekly",  "Weekly Growth", "trending_up"],
            ["mastery", "Total Mastery", "military_tech"],
          ].map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all font-display whitespace-nowrap ${
                tab === key
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] scale-[1.02] border border-white/20"
                  : "bg-white/5 text-white/30 border border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="material-symbols-rounded text-base">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* ── Main Leaderboard ── */}
        {error ? (
          <div className="glass-card rounded-3xl p-16 text-center border-white/5 bg-white/[0.01]">
            <span className="material-symbols-rounded text-white/10 text-7xl mb-6 block">leaderboard</span>
            <p className="text-white/40 font-bold italic tracking-wide uppercase mb-8">{error}</p>
            <button onClick={() => router.push("/dashboard")} className="px-10 py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.3em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
              Return to Command Center
            </button>
          </div>
        ) : rows.length > 0 ? (
          <div className="glass-card rounded-[2rem] overflow-hidden border-white/5 bg-[#0d0d0d]/40 backdrop-blur-md shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-6 font-display uppercase tracking-widest text-[11px] font-black text-white/40">Rank</th>
                    <th className="px-8 py-6 font-display uppercase tracking-widest text-[11px] font-black text-white/40">Cadet Identity</th>
                    {tab === "weekly" && (
                      <th className="px-8 py-6 font-display uppercase tracking-widest text-[11px] font-black text-white/40 text-center">
                        Combat XP
                      </th>
                    )}
                    <th className="px-8 py-6 font-display uppercase tracking-widest text-[11px] font-black text-white/40 text-center">Accuracy</th>
                    <th className="px-8 py-6 font-display uppercase tracking-widest text-[11px] font-black text-white/40 text-center">Consistency</th>
                    <th className="px-8 py-6 font-display uppercase tracking-widest text-[11px] font-black text-white/40 text-right">Strategic Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {verifiedRows.map((row) => {
                    const isMe = row.userId === myId;
                    const medal = row.rank === 1 ? "gold" : row.rank === 2 ? "silver" : row.rank === 3 ? "bronze" : null;
                    const rankColor = medal === "gold" ? "text-yellow-400" : medal === "silver" ? "text-slate-300" : medal === "bronze" ? "text-orange-600" : isMe ? "text-primary font-black" : "text-white/30";
                    
                    return (
                      <tr key={row.userId} className={`transition-all group ${isMe ? "bg-primary/5 ring-inset ring-1 ring-primary/30" : "hover:bg-white/[0.03]"}`}>
                        <td className="px-8 py-6">
                          <span className={`text-3xl font-black font-display italic tracking-tight ${rankColor}`}>
                            {row.rank < 10 ? `0${row.rank}` : row.rank}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black border transition-transform group-hover:scale-110 ${isMe ? "border-primary bg-primary/20 text-primary" : avatarStyle(row.userId)}`}>
                              {isMe ? myName.charAt(0) : shortId(row.userId).charAt(0)}
                            </div>
                            <div>
                                <p className={`text-base font-black tracking-tight ${isMe ? "text-primary" : "text-white"}`}>
                                    {isMe ? `${myName.toUpperCase()} (YOU)` : `CADET-${shortId(row.userId)}`}
                                </p>
                            </div>
                          </div>
                        </td>
                        {tab === "weekly" && (
                          <td className="px-8 py-6 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-black font-display text-xl text-white">
                                  {(row.eligibleXP || row.score || 0).toLocaleString()}
                              </span>
                              <span className="text-[9px] text-white/20 font-black uppercase tracking-tighter">Current Growth</span>
                            </div>
                          </td>
                        )}
                        <td className="px-8 py-6 text-center">
                           <div className={`text-xs font-black px-3 py-1.5 rounded-lg inline-block ${pctColor(row.accuracy)} bg-black/40 border border-white/5`}>
                              {Math.round((row.accuracy || 0) * 100)}%
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <div className="flex items-center justify-center gap-1.5">
                              {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className={`w-1 h-4 rounded-full transition-all ${i < (row.activeDays || 0) ? "bg-primary shadow-[0_0_5px_rgba(255,107,0,0.5)]" : "bg-white/5"}`}></div>
                              ))}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right font-display font-black text-2xl text-primary tracking-tighter">
                          {Math.round(row.score || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-[2rem] p-24 text-center border-dashed border-2 border-white/5 bg-white/[0.01]">
             <p className="text-white/20 text-sm font-black uppercase tracking-widest italic">Simulation Environment Empty. Begin Chapter 1 to sync data.</p>
          </div>
        )}

        {/* ── Tactical Milestones ── */}
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="font-display text-2xl font-black uppercase tracking-widest text-white">
              Tactical Milestones
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/40 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MILESTONES.map(({ icon, title, desc }) => (
              <div key={title} className="glass-card hover:translate-y-[-5px] hover:border-primary/40 p-6 rounded-3xl flex flex-col items-start gap-4 group cursor-pointer transition-all border-white/5 bg-white/[0.02] relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
                <div className="bg-primary/10 p-3 rounded-2xl border border-white/5">
                  <span className="material-symbols-rounded text-3xl text-primary">{icon}</span>
                </div>
                <div>
                  <p className="font-black font-display text-xl text-white tracking-tight uppercase">{title}</p>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.1em] mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}