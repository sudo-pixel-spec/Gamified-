"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { getToken, apiFetch } from "../../lib/api";
import { resolveStandardCodeToId } from "../../lib/curriculum-api";
import { getRankInfo } from "../../lib/ranks";
import { motion, AnimatePresence } from "framer-motion";

const SUBJECT_COLOR_MAP = [
  { bg: "bg-blue-500/10",    text: "text-blue-400",    badge: "bg-blue-500/20 text-blue-300 border-blue-500/20",       icon: "functions" },
  { bg: "bg-purple-500/10",  text: "text-purple-400",  badge: "bg-purple-500/20 text-purple-300 border-purple-500/20",  icon: "biotech" },
  { bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20", icon: "language" },
  { bg: "bg-amber-500/10",   text: "text-amber-400",   badge: "bg-amber-500/20 text-amber-300 border-amber-500/20",    icon: "history_edu" },
  { bg: "bg-rose-500/10",    text: "text-rose-400",    badge: "bg-rose-500/20 text-rose-300 border-rose-500/20",       icon: "palette" },
  { bg: "bg-cyan-500/10",    text: "text-cyan-400",    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/20",       icon: "computer" },
];

export default function Analytics() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useRequireAuth();
  
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [dashboardHome, setDashboardHome] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chartType, setChartType] = useState("bar"); // bar | line

  useEffect(() => {
    if (authLoading) return;
    const token = getToken();
    if (!token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [meData, anaData, growthData, homeData] = await Promise.all([
          apiFetch("/v1/me"),
          apiFetch("/v1/analytics"),
          apiFetch("/v1/leaderboards/weekly-growth"),
          apiFetch("/v1/dashboard/home").catch(() => null)
        ]);
        
        if (cancelled) return;
        setMe(meData?.data ?? meData);
        setAnalytics(anaData?.data ?? anaData);
        setGrowth(growthData?.data?.entries ?? growthData?.entries ?? []);
        setDashboardHome(homeData?.data ?? homeData);

        const stdRaw = meData?.profile?.standardId || meData?.profile?.standard;
        if (stdRaw) {
          try {
            // Resolve standard code or ID to the exact database ID for the curriculum route
            const resolvedId = await resolveStandardCodeToId(stdRaw);
            const subData = await apiFetch(`/v1/curriculum/subjects?standardId=${encodeURIComponent(resolvedId)}`);
            if (!cancelled) {
               const list = Array.isArray(subData) ? subData : subData?.data ?? subData?.items ?? subData?.subjects ?? [];
               setSubjects(Array.isArray(list) ? list : []);
            }
          } catch (e) {
            console.error("Failed to fetch subjects:", e);
          }
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading]);

  const totalXP   = me?.totalXP ?? 0;
  const streak    = me?.streakCount ?? 0;
  const level     = me?.level ?? 1;
  const name        = me?.profile?.fullName || "Learner";
  const firstName   = name.split(" ")[0];
  const xpPerLevel  = 500;
  const xpInLevel   = totalXP % xpPerLevel;
  const xpNeeded    = xpPerLevel - xpInLevel;
  const progressPct = Math.round((xpInLevel / xpPerLevel) * 100);

  const rankInfo  = getRankInfo(totalXP);
  const rankName  = rankInfo.label;
  
  const myRank = useMemo(() => {
    if (!me?.id && !me?._id) return null;
    const myId = me?.id || me?._id;
    const idx = growth.findIndex(e => e.userId === myId);
    return idx >= 0 ? idx + 1 : "—";
  }, [growth, me]);

  const xpHistory = useMemo(() => {
    // Backend returns [{ date, xp }, ...] for last 28 days
    const raw = analytics?.xpHistory || [];
    if (raw.length === 0) return [];
    // Showing 28 days for the full heatmap grid
    return raw.slice(-28);
  }, [analytics]);

  const maxXP = useMemo(() => {
    if (xpHistory.length === 0) return 100;
    const m = Math.max(...xpHistory.map(h => typeof h === 'number' ? h : h.xp ?? 0), 100);
    return m;
  }, [xpHistory]);

  const subjectProgress = useMemo(() => {
    const list = Array.isArray(analytics?.subjectStrengths) ? analytics.subjectStrengths : [];
    if (list.length === 0) return [];
    return list.map(s => ({
      name: s.subject || "Subject",
      pct: s.avgScore ?? 0
    }));
  }, [analytics]);

  const myId = me?.id || me?._id;
  const myEntry = growth.find(e => String(e.userId) === String(myId));
  
  // Robust completion calculation - combining all possible progress fields
  const completedSet = useMemo(() => {
    const ids = new Set();
    const sources = [
      me?.progress?.completedLessons,
      dashboardHome?.progress?.completedLessons,
      dashboardHome?.completedLessons,
      analytics?.completedLessons
    ];
    sources.forEach(src => {
      if (Array.isArray(src)) src.forEach(id => ids.add(String(id)));
    });
    return ids;
  }, [me, dashboardHome, analytics]);

  const lessonsMastered = Math.max(completedSet.size, myEntry?.lessonsCompleted || me?.lessonsCompleted || 0);
  const chaptersMastered = analytics?.chaptersCompleted || analytics?.totalChaptersCompleted || me?.stats?.chaptersCompleted || 0;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* background HUD effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Computerized Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,107,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,107,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        {/* Atmospheric Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Nav is now provided globally by layout.jsx */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">

        {/* hero + level card — DASHBOARD STYLE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl font-display font-black text-white leading-tight tracking-tight">
                 ANALYTICS: <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary animate-shine bg-[length:200%_auto]">{firstName}</span>.
              </h1>
            </div>
            <p className="text-white/60 text-xs italic tracking-wide">Track your trajectory across the cosmos of knowledge.</p>
          </div>
          <div className="glass-card glow-orange p-5 rounded-2xl relative group overflow-hidden border-primary/30 ring-1 ring-white/10">
            {/* Tactical Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/60"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary/60"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary/60"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/60"></div>

            <div className="flex justify-between items-start mb-3 relative z-10">
              <div>
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Combat Rating</p>
                <h3 className="text-xl font-display font-black text-white italic">LVL {level}</h3>
              </div>
              <div className="flex flex-col items-end">
                 <p className="text-sm font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{totalXP.toLocaleString()} <span className="text-[10px] text-primary">XP</span></p>
              </div>
            </div>
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-scan"></div>
              <div className="h-full bg-gradient-to-r from-primary via-orange-400 to-primary rounded-full shadow-[0_0_15px_rgba(255,107,0,0.6)] relative z-10" style={{ width: `${progressPct}%` }}></div>
            </div>
            <p className="text-[9px] font-bold text-white/30 mt-3 text-center uppercase tracking-widest">Target: {xpNeeded} XP to <span className="text-white/70">Promote</span></p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
          {[
            { label: "Total XP", value: totalXP.toLocaleString(), icon: "stars", sub: `Daily average: ${Math.round(totalXP / 30)} XP`, subColor: "text-primary" },
            { label: "Lessons Mastered", value: lessonsMastered, icon: "check_circle", sub: "Target: 100%", subColor: "text-emerald-500" },
            { label: "Chapters", value: chaptersMastered, icon: "auto_stories", sub: "Across all subjects", subColor: "text-purple-400" },
            { label: "Rank", value: rankName, icon: "workspace_premium", sub: `Global Pos: #${myRank}`, subColor: "text-white/40" },
            { label: "Level", value: `Level ${level}`, icon: "trending_up", sub: "Keep ascending", subColor: "text-white/40" },
            { label: "Correctness", value: `${analytics?.avgScore ?? 0}%`, icon: "fact_check", sub: "Based on all attempts", subColor: "text-white/40" },
          ].map(({ label, value, icon, sub, subColor }) => (
            <Link key={label} href={label === "Rank" ? "/leaderboard" : "#"} className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl hover:border-primary/40 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/50 text-sm font-medium">{label}</span>
                <span className="material-icons-round text-primary group-hover:scale-110 transition-transform">{icon}</span>
              </div>
              <div className="text-3xl font-display font-bold text-white">{value}</div>
              <div className={`mt-2 text-xs flex items-center gap-1 ${subColor}`}>
                {subColor === "text-primary" && <span className="material-icons-round text-xs">trending_up</span>}
                {sub}
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">

            {/* Knowledge Trajectory Chart */}
            <div className="bg-[#141414] border border-orange-500/20 p-8 rounded-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Knowledge Trajectory</h2>
                  <p className="text-sm text-white/40">XP earned over the last 14 days</p>
                </div>
                <div className="flex items-center bg-[#1a1a1a] p-1 rounded-lg border border-orange-500/20">
                   <button 
                     onClick={() => setChartType("bar")}
                     className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${chartType === "bar" ? "bg-primary text-white" : "text-white/40 hover:text-white"}`}
                   >
                     Bar
                   </button>
                   <button 
                     onClick={() => setChartType("line")}
                     className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${chartType === "line" ? "bg-primary text-white" : "text-white/40 hover:text-white"}`}
                   >
                     Line
                   </button>
                </div>
              </div>
              <div className="h-64 relative">
                {chartType === "bar" ? (
                  <div className="h-full flex items-end justify-between gap-1 sm:gap-2">
                    {xpHistory.map((item, i) => {
                      const h = typeof item === 'number' ? item : item.xp ?? 0;
                      const d = typeof item === 'number' ? null : item.date;
                      const dateLabel = d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                      const barHeight = Math.min(100, Math.round((h / maxXP) * 100));
                      return (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-t-full transition-all cursor-pointer group relative ${i === xpHistory.length - 1 ? 'bg-primary hover:bg-orange-400' : 'bg-primary/30 hover:bg-primary/50'}`} 
                          style={{ height: `${barHeight}%` }}
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-20 flex flex-col items-center">
                            <span className="text-white/40 mb-0.5">{dateLabel}</span>
                            <span className="font-bold text-white">{h} XP</span>
                          </div>
                          {i === xpHistory.length - 1 && <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-lg animate-pulse z-30">Today!</div>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full group">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Smooth Finance-style Line */}
                      <path 
                        d={(() => {
                          if (xpHistory.length < 2) return "";
                          const points = xpHistory.map((item, i) => {
                            const h = typeof item === 'number' ? item : item.xp ?? 0;
                            return { x: (i / (xpHistory.length - 1)) * 100, y: 100 - (h / maxXP) * 100 };
                          });
                          
                          // Build a smooth cubic bezier path
                          let d = `M ${points[0].x} ${points[0].y}`;
                          for (let i = 0; i < points.length - 1; i++) {
                            const curr = points[i];
                            const next = points[i + 1];
                            const cp1x = curr.x + (next.x - curr.x) / 2;
                            const cp2x = curr.x + (next.x - curr.x) / 2;
                            d += ` C ${cp1x} ${curr.y}, ${cp2x} ${next.y}, ${next.x} ${next.y}`;
                          }
                          return d;
                        })()}
                        fill="none" 
                        stroke="#ff6b00" 
                        strokeWidth="0.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-700 ease-in-out"
                      />
                      {/* Subtle data points */}
                      {xpHistory.map((item, i) => {
                        const h = typeof item === 'number' ? item : item.xp ?? 0;
                        return (
                          <circle 
                             key={i}
                             cx={(i / (xpHistory.length - 1)) * 100} 
                             cy={100 - (h / maxXP) * 100} 
                             r="0.5" 
                             className="fill-primary/50 group-hover:fill-primary transition-colors"
                          />
                        );
                      })}
                    </svg>
                    {/* Tooltip Overlay (Invisible triggers) */}
                    <div className="absolute inset-0 flex">
                      {xpHistory.map((item, i) => {
                        const h = typeof item === 'number' ? item : item.xp ?? 0;
                        const d = typeof item === 'number' ? null : item.date;
                        const dateLabel = d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
                        return (
                          <div key={i} className="flex-1 group/mark relative">
                             <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5 opacity-0 group-hover/mark:opacity-100"></div>
                             <div className="absolute left-1/2 -translate-x-1/2 bg-black/90 text-[9px] px-2 py-1 rounded opacity-0 group-hover/mark:opacity-100 border border-white/10 z-20 whitespace-nowrap flex flex-col items-center" style={{ top: `${80 - (h / maxXP) * 80}%` }}>
                                <span className="text-white/40 mb-0.5">{dateLabel}</span>
                                <span className="font-bold text-white">{h} XP</span>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-[-24px] w-full flex justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  <span>2 Weeks</span>
                  <span>Yesterday</span>
                  <span className="text-primary">Today</span>
                </div>
              </div>
            </div>

            {/* Strengths & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl">
                <h3 className="font-display font-bold mb-6 flex items-center gap-2 text-white">
                  <span className="material-icons-round text-green-400">trending_up</span> Strengths
                </h3>
                <div className="space-y-6">
                  {subjectProgress.length === 0 ? (
                    <p className="text-sm text-white/30 text-center py-4">No mastery data yet.</p>
                  ) : subjectProgress.map(({ name, pct }, idx) => (
                    <div key={`${name}-${idx}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-white/80">{name}</span>
                        <span className="text-green-400 font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl">
                <h3 className="font-display font-bold mb-6 flex items-center gap-2 text-white">
                  <span className="material-icons-round text-red-400">warning</span> Challenges
                </h3>
                <div className="space-y-6">
                  {subjects.length > 0 ? (
                    subjects.slice(-2).map(sub => (
                      <div 
                        key={sub._id || sub.id} 
                        className="cursor-pointer hover:bg-white/5 p-3 -m-1 rounded-xl transition-all group border border-transparent hover:border-orange-500/10"
                        onClick={() => router.push(`/structure?subjectId=${sub._id || sub.id}`)}
                      >
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-white/80 group-hover:text-primary transition-colors">{sub.name}</span>
                          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest group-hover:text-primary transition-colors">Launch Mission</span>
                        </div>
                        <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                          <div className="h-full bg-primary/20 group-hover:bg-primary/50 rounded-full transition-all" style={{ width: `0%` }}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                       <p className="text-xs text-white/30 mb-4 italic">Finish your current courses to reveal new challenges.</p>
                    </div>
                  )}
                  <Link href="/subjects" className="block w-full py-2 bg-primary/10 text-primary text-sm font-bold rounded-lg hover:bg-primary/20 transition-all border border-primary/20 text-center">
                    Launch Review Session
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">

            {/* Learning Consistency */}
            <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl">
              <h3 className="font-display font-bold mb-4 flex items-center justify-between text-white">
                Learning Consistency
                <span className="text-xs font-normal text-white/40 uppercase tracking-widest">Recent Activity</span>
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {["M","T","W","T","F","S","S"].map((d,i) => (
                  <div key={i} className="text-[10px] text-center text-white/30 font-bold">{d}</div>
                ))}
                {/* Real 28-day activity heatmap grid */}
                {(xpHistory.length > 0 ? xpHistory : Array.from({ length: 28 }).fill(0)).map((xp, i) => {
                  const val = typeof xp === 'number' ? xp : xp?.xp ?? 0;
                  const intensity = val > 500 ? "bg-primary" : val > 100 ? "bg-primary/60" : val > 0 ? "bg-primary/30" : "bg-[#1a1a1a] border border-white/5";
                  return (
                    <div key={i}
                      className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 ${intensity} ${val > 0 ? "text-white" : "text-transparent"}`}
                      title={`${val} XP`}
                    ></div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-4 border-t border-orange-500/10 pt-4">
                {[
                  [streak, "Current Streak"],
                  [analytics?.bestStreak ?? streak, "Best Streak"],
                  [level, "User Level"]
                ].map(([val, sub], i) => (
                  <div key={i} className="text-center flex-1">
                    <div className={`text-sm font-bold ${i === 1 ? "text-primary" : "text-white"}`}>{val}</div>
                    <div className="text-[10px] text-white/30 uppercase">{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Attempts */}
            <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl">
              <h3 className="font-display font-bold mb-4 text-white">Curriculum Status</h3>
              <div className="space-y-4">
                {(!Array.isArray(subjects) || subjects.length === 0) ? (
                  <p className="text-xs text-white/30">Enroll in courses to track missions.</p>
                ) : subjects.slice(0, 3).map((sub, idx) => {
                   const c = SUBJECT_COLOR_MAP[idx % SUBJECT_COLOR_MAP.length];
                   return (
                    <div key={sub._id || sub.id} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-white/5 ${c.bg}`}>
                        <span className={`material-icons-round ${c.text}`}>{c.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white truncate max-w-[120px]">{sub.name || sub.title}</div>
                        <div className="text-xs text-white/40">{sub.lessonCount ?? 0} Chapters</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold text-primary`}>ACTIVE</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link href="/subjects" className="w-full mt-6 text-xs text-white/30 hover:text-primary transition-colors flex items-center justify-center gap-1 font-bold uppercase no-underline">
                VIEW ALL COURSES <span className="material-icons-round text-xs">arrow_forward</span>
              </Link>
            </div>

            {/* Achievements */}
            <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl overflow-hidden relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white">Achievements</h3>
                <span className="text-xs text-primary font-bold">{analytics?.badgesCount ?? 1} / 48</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {(!me?.badges || me.badges.length === 0) ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                    <span className="material-icons-round text-white/10 text-4xl mb-2">military_tech</span>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">No badges unlocked yet</p>
                  </div>
                ) : me.badges.map((bName) => {
                  // Dynamic mapping of badge string to icons/styles
                  const b = (typeof bName === 'string') ? { 
                    label: bName, 
                    icon: bName.toLowerCase().includes("streak") ? "local_fire_department" : bName.toLowerCase().includes("explorer") ? "psychology" : "workspace_premium",
                    grad: bName.toLowerCase().includes("king") ? "from-orange-600 to-yellow-400" : "from-blue-600 to-cyan-400",
                    shadow: "shadow-primary/20",
                    color: "text-primary"
                  } : bName;

                  return (
                    <div key={b.label} className="min-w-[70px] flex flex-col items-center gap-2">
                       <div className={`w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr ${b.grad} shadow-lg ${b.shadow}`}>
                        <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center border-2 border-white/10">
                          <span className={`material-icons-round text-2xl ${b.color}`}>{b.icon}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-center font-bold uppercase text-white/40">{b.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-pulse border border-primary/20">
              <span className="material-icons-round text-primary">tips_and_updates</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Pro Tip: Fuel your engine!</h4>
              <p className="text-xs text-white/40">Consistent daily reviews Increase retention by up to 15%.</p>
            </div>
          </div>
          {/* Navigation is now handled by GlobalNav */}
        </footer>
      </main>
    </div>
  );
}