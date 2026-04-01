"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { getToken, apiFetch } from "../../lib/api";
import { resolveStandardCodeToId } from "../../lib/curriculum-api";

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
  const [analytics, setAnalytics] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    const token = getToken();
    if (!token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [meData, anaData, growthData] = await Promise.all([
          apiFetch("/v1/me"),
          apiFetch("/v1/analytics"),
          apiFetch("/v1/leaderboards/weekly-growth")
        ]);
        
        if (cancelled) return;
        setMe(meData?.data ?? meData);
        setAnalytics(anaData?.data ?? anaData);
        setGrowth(growthData?.data?.entries ?? growthData?.entries ?? []);

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
  const rankName  = totalXP > 10000 ? "Solar Cadet" : totalXP > 5000 ? "Nova Commander" : "Planetary Scout";
  
  const myRank = useMemo(() => {
    if (!me?.id && !me?._id) return null;
    const myId = me?.id || me?._id;
    const idx = growth.findIndex(e => e.userId === myId);
    return idx >= 0 ? idx + 1 : "—";
  }, [growth, me]);

  const xpHistory = useMemo(() => {
    // Backend returns [{ date, xp }, ...]. Frontend chart needs a list of numbers.
    const raw = analytics?.xpHistory || [25, 40, 20, 60, 50, 90, 33, 40, 75, 80, 50, 70, 25, 95];
    const items = raw.map(i => (typeof i === "number" ? i : i.xp ?? 0));
    return items.slice(-14);
  }, [analytics]);

  const maxXP = useMemo(() => {
    const m = Math.max(...xpHistory, 100); // Default max at 100 to avoid huge bars for low XP
    return m;
  }, [xpHistory]);

  const subjectProgress = useMemo(() => {
    // Placeholder calculation until backend provides direct mastery data
    const list = Array.isArray(subjects) ? subjects : [];
    return list.slice(0, 3).map(sub => ({
      name: sub.name || sub.title || "Subject",
      pct: Math.min(100, Math.floor(Math.random() * 40) + 60) // Simulated stats
    }));
  }, [subjects]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Background blobs */}
      <div className="fixed top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Nav */}
      <nav className="border-b border-orange-500/20 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-3">
                <img src="/images/logo.png" alt="Gamified Logo" className="w-9 h-9 drop-shadow-sm" />
                <span className="font-display font-bold text-xl tracking-tight text-white">Gamified</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link className="text-white/50 hover:text-primary transition-colors text-sm font-medium" href="/dashboard">Dashboard</Link>
              <Link className="text-primary font-semibold border-b-2 border-primary text-sm" href="/analytics">Analytics</Link>
              <Link className="text-white/50 hover:text-primary transition-colors text-sm font-medium" href="/leaderboard">Leaderboard</Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                <span className="material-icons-round text-primary text-sm">local_fire_department</span>
                <span className="font-bold text-primary text-sm">{streak} Day Streak</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        <header className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-2 text-white">Command Center</h1>
          <p className="text-white/50">Track your trajectory across the cosmos of knowledge.</p>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total XP", value: totalXP.toLocaleString(), icon: "stars", sub: `Daily average: ${Math.round(totalXP / 30)} XP`, subColor: "text-primary" },
            { label: "Rank", value: rankName, icon: "workspace_premium", sub: `Global Pos: #${myRank}`, subColor: "text-white/40" },
            { label: "Level", value: `Level ${level}`, icon: "trending_up", sub: "Keep ascending", subColor: "text-white/40" },
            { label: "Correctness", value: `${analytics?.accuracy ?? "88.4"}%`, icon: "fact_check", sub: "Top 5% in your grade", subColor: "text-white/40" },
          ].map(({ label, value, icon, sub, subColor }) => (
            <div key={label} className="bg-[#141414] border border-orange-500/20 p-6 rounded-xl hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/50 text-sm font-medium">{label}</span>
                <span className="material-icons-round text-primary">{icon}</span>
              </div>
              <div className="text-3xl font-display font-bold text-white">{value}</div>
              <div className={`mt-2 text-xs flex items-center gap-1 ${subColor}`}>
                {subColor === "text-primary" && <span className="material-icons-round text-xs">trending_up</span>}
                {sub}
              </div>
            </div>
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
                <select className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg text-sm text-white/70 px-3 py-1.5 focus:outline-none focus:border-primary">
                  <option>Last 14 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-64 flex items-end justify-between gap-2 relative">
                {xpHistory.map((h, i) => {
                  const barHeight = Math.min(100, Math.round((h / maxXP) * 100));
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-lg transition-all cursor-pointer group relative ${i === xpHistory.length - 1 ? 'bg-primary hover:shadow-[0_-5px_15px_rgba(255,107,0,0.5)]' : 'bg-primary/30 hover:bg-primary/50'}`} 
                      style={{ height: `${barHeight}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
                        {h} XP
                      </div>
                      {i === xpHistory.length - 1 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold bg-primary text-white px-2 py-1 rounded whitespace-nowrap">Today</div>}
                    </div>
                  );
                })}
                <div className="absolute bottom-[-24px] w-full flex justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  <span>2 Weeks Ago</span>
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
                  ) : subjectProgress.map(({ name, pct }) => (
                    <div key={name}>
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
                  {subjects.length > 3 ? (
                    subjects.slice(-2).map(sub => (
                      <div key={sub._id || sub.id}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-white/80">{sub.name}</span>
                          <span className="text-white/40">Not Started</span>
                        </div>
                        <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                          <div className="h-full bg-primary/40 rounded-full" style={{ width: `0%` }}></div>
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
                {/* 21 empty/placeholders until full activity heatmap logic is added */}
                {Array.from({ length: 21 }).map((_, i) => (
                  <div key={i}
                    className={`aspect-square rounded-md flex items-center justify-center text-xs ${
                      i < streak ? "bg-primary text-white" : "bg-[#1a1a1a] border border-white/5"
                    }`}
                  ></div>
                ))}
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
                {[
                  { grad: "from-orange-600 to-yellow-400", icon: "auto_awesome", color: "text-primary", label: "Streak King" },
                  { grad: null, icon: "speed", color: "text-white/20", label: "Supersonic", locked: true },
                  { grad: "from-purple-600 to-blue-400", icon: "psychology", color: "text-purple-400", label: "Explorer", shadow: "shadow-purple-500/20" },
                  { grad: "from-green-600 to-emerald-400", icon: "verified", color: "text-green-400", label: "Master", shadow: "shadow-green-500/20" },
                ].map(({ grad, icon, color, label, locked, shadow }) => (
                  <div key={label} className={`min-w-[70px] flex flex-col items-center gap-2 ${locked ? 'opacity-40 grayscale' : ''}`}>
                    <div className={`w-14 h-14 rounded-full p-0.5 ${grad ? `bg-gradient-to-tr ${grad} shadow-lg ${shadow || 'shadow-primary/20'}` : 'bg-[#222]'}`}>
                      <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center border-2 border-white/10">
                        <span className={`material-icons-round text-2xl ${color}`}>{icon}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-center font-bold uppercase text-white/40">{label}</span>
                  </div>
                ))}
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
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-orange-500/20 font-bold text-sm hover:bg-white/5 hover:border-primary/40 text-white/60 hover:text-white transition-all">
              Download Full Report
            </button>
            <button 
              onClick={() => router.push("/dashboard")}
              className="flex-1 md:flex-none px-8 py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-primary/25 text-center"
            >
              Return to Dashboard
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}