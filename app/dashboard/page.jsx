"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { getToken } from "../../lib/api";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL;

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error?.message || "Request failed");
  }
  return json?.data ?? json;
}

function formatXP(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function Dashboard() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Derive last lesson to play
  const handlePlay = () => {
    const lastLesson = me?.progress?.lastLessonId || me?.stats?.lastLessonId;
    if (lastLesson) {
      router.push(`/lesson?lessonId=${lastLesson}`);
    } else {
      router.push("/subjects");
    }
  };

  // ── fetch live data ──
  useEffect(() => {
    if (authLoading) return;
    const token = getToken();
    if (!token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [meData, growthData] = await Promise.all([
          api("/v1/me", { token }),
          api("/v1/leaderboards/weekly-growth", { token }),
        ]);
        if (cancelled) return;

        if (!meData?.profileComplete) { router.replace("/completeprofile"); return; }

        setMe(meData);
        setGrowth(growthData?.entries || []);

        // fetch subjects for the user's standard
        const stdKey = meData?.profile?.standard;
        if (stdKey) {
          try {
            const subData = await api(`/v1/admin/subjects?standard=${encodeURIComponent(stdKey)}`, { token });
            if (!cancelled) setSubjects(Array.isArray(subData) ? subData : subData?.items ?? subData?.subjects ?? []);
          } catch { /* subjects fetch is non-critical */ }
        }
      } catch {
        /* silent – keeps last loaded state */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, router]);

  // ── derived values ──
  const name        = me?.profile?.fullName || "Learner";
  const firstName   = name.split(" ")[0];
  const level       = me?.level ?? 1;
  const totalXP     = me?.totalXP ?? 0;
  const xpPerLevel  = 500;                       // matches backend: floor(totalXP/500)+1
  const xpInLevel   = totalXP % xpPerLevel;
  const xpNeeded    = xpPerLevel - xpInLevel;
  const progressPct = Math.round((xpInLevel / xpPerLevel) * 100);
  const streak      = me?.streakCount ?? 0;
  const coins       = me?.wallet?.coins ?? 0;
  const diamonds    = me?.wallet?.diamonds ?? 0;

  // top-3 leaderboard + "You" row
  const top3 = useMemo(() => {
    const entries = growth.slice(0, 3).map((e, i) => ({
      rank: i + 1,
      name: e.userId,          // backend returns userId; replace with displayName if you add it later
      score: e.score,
      eligibleXP: e.eligibleXP,
      isYou: me?.id === e.userId,
    }));
    return entries;
  }, [growth, me]);

  const myRank = useMemo(() => {
    if (!me?.id) return null;
    const i = growth.findIndex((x) => x.userId === me.id);
    return i >= 0 ? i + 1 : null;
  }, [growth, me]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-display animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <>
    {/* ── background blobs ── */}
    <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-40 overflow-hidden">
        <div className="star-field absolute inset-0"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-900/10 rounded-full blur-[100px]"></div>
    </div>

    {/* ── navbar ── */}
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10  rounded-lg flex items-center justify-center">
            <div className="relative w-10 h-10">
  <Image
    src="/images/logo.png"
    alt="Gamified Logo"
    fill
    className="object-contain"
  />
</div>
                        </div>
                        <span className="text-xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-orange">GAMIFIED</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/dashboard" className="text-sm font-medium text-primary">Dashboard</Link>
                        <Link href="/subjects" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Courses</Link>
                        <Link href="/analytics" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Analytics</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10">
                        <span className="material-symbols-rounded text-yellow-400 text-lg">bolt</span>
                        <span className="text-xs font-bold font-display uppercase tracking-wider">{totalXP.toLocaleString()} XP</span>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-50 dark:bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        <span className="material-symbols-rounded text-primary text-lg">local_fire_department</span>
                        <span className="text-xs font-bold text-primary font-display">{streak} DAY STREAK</span>
                    </div>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold leading-none">{name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Level {level}</p>
                        </div>
                        <Link href="/completeprofile" className="block w-9 h-9 rounded-full ring-2 ring-primary/30 p-0.5 hover:ring-primary/60 transition-all cursor-pointer">
                            <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                              {firstName.charAt(0).toUpperCase()}
                            </div>
                        </Link>
                        <button 
                            onClick={() => setDrawerOpen((prev) => !prev)}
                            className="ml-2 text-slate-400 hover:text-primary transition-colors flex items-center"
                        >
                            <span className="material-symbols-rounded text-2xl">menu</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    {/* ── main ── */}
    <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* hero + level card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 flex flex-col justify-center">
                <h1 className="text-4xl font-display font-bold mb-2">Welcome back, <span className="text-primary">{firstName}</span>.</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Your learning voyage continues. Today&apos;s goal: 500 XP.</p>
            </div>
            <div className="glass-card dark:bg-card-dark p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Status</p>
                        <h3 className="text-xl font-display font-bold">Level {level} <span className="text-slate-400 font-normal">/ {level + 1}</span></h3>
                    </div>
                    <p className="text-sm font-bold text-primary">{xpInLevel} / {xpPerLevel} XP</p>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent-orange rounded-full shadow-[0_0_15px_rgba(255,107,0,0.4)]" style={{ width: `${progressPct}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 text-center">{xpNeeded} XP to reach <span className="text-slate-800 dark:text-slate-300 font-semibold">Level {level + 1}</span></p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
                {/* ── quick actions ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/subjects" className="glass-card bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl transition-colors flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-rounded">school</span>
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-lg text-blue-100">Browse Courses</h3>
                            <p className="text-xs text-blue-300">Explore subjects and lessons</p>
                        </div>
                    </Link>
                    <Link href="/analytics" className="glass-card bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl transition-colors flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-rounded">monitoring</span>
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-lg text-emerald-100">View Analytics</h3>
                            <p className="text-xs text-emerald-300">Track your progress stats</p>
                        </div>
                    </Link>
                </div>

                {/* ── daily revision (live from backend) ── */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-display font-bold flex items-center gap-2">
                            <span className="material-symbols-rounded text-primary">auto_stories</span>
                            Daily Revision
                        </h2>
                        <a className="text-xs font-bold text-primary hover:underline" href="#">VIEW ALL</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.length === 0 ? (
                            <p className="text-sm text-slate-500 col-span-2 text-center py-8">No subjects assigned yet.</p>
                        ) : (
                            subjects.map((sub, i) => {
                                const colors = [
                                    { bg: "bg-blue-500/10", text: "text-blue-500", badge: "bg-blue-500/20 text-blue-400" },
                                    { bg: "bg-purple-500/10", text: "text-purple-500", badge: "bg-purple-500/20 text-purple-400" },
                                    { bg: "bg-emerald-500/10", text: "text-emerald-500", badge: "bg-emerald-500/20 text-emerald-400" },
                                    { bg: "bg-amber-500/10", text: "text-amber-500", badge: "bg-amber-500/20 text-amber-400" },
                                    { bg: "bg-rose-500/10", text: "text-rose-500", badge: "bg-rose-500/20 text-rose-400" },
                                    { bg: "bg-cyan-500/10", text: "text-cyan-500", badge: "bg-cyan-500/20 text-cyan-400" },
                                ];
                                const icons = ["functions", "biotech", "language", "history_edu", "palette", "computer"];
                                const c = colors[i % colors.length];
                                const icon = icons[i % icons.length];
                                const label = (sub.name || sub.title || "Subject").toUpperCase();

                                const subjectId = sub._id || sub.id;

                                return (
                                  <button
                                    key={subjectId || i}
                                    type="button"
                                    onClick={() => {
                                      if (subjectId) router.push(`/structure?subjectId=${encodeURIComponent(subjectId)}`);
                                    }}
                                    disabled={!subjectId}
                                    className="glass-card dark:bg-card-dark p-6 rounded-2xl group cursor-pointer hover:border-primary/40 transition-all duration-300 text-left w-full disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 ${c.bg} rounded-xl`}>
                                                <span className={`material-symbols-rounded ${c.text}`}>{icon}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 ${c.badge} rounded`}>{label}</span>
                                        </div>
                                        <h4 className="text-lg font-display font-semibold mb-2 group-hover:text-primary transition-colors">{sub.name || sub.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{sub.description || "Continue your learning journey."}</p>
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-400">{sub.lessonCount ? `${sub.lessonCount} Lessons` : ""}</span>
                                            <div className="flex items-center gap-1 text-primary">
                                            <span>{subjectId ? "START" : "UNAVAILABLE"}</span>
                                                <span className="material-symbols-rounded text-sm">arrow_forward</span>
                                            </div>
                                        </div>
                                      </button>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* ── habit engine ── */}
                <section className="glass-card bg-primary/5 border-primary/20 p-8 rounded-3xl overflow-hidden relative">
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <h2 className="text-2xl font-display font-bold mb-4">The Habit Engine</h2>
                            <p className="text-slate-400 mb-8 max-w-md text-sm leading-relaxed">By gamifying consistency, we help you develop vital self-discipline and a continuous learning mindset.</p>
                            <div className="space-y-8">
                                <div className="flex gap-6 relative">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary font-bold z-10">1</div>
                                        <div className="w-0.5 h-full bg-primary/20 absolute top-10"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-display font-bold text-lg">Daily Learning Streaks</h4>
                                        <p className="text-sm text-slate-500">Encourages consistent engagement, turning learning into a daily habit.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 relative">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary font-bold z-10">2</div>
                                        <div className="w-0.5 h-full bg-primary/20 absolute top-10"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-display font-bold text-lg">XP &amp; Levels</h4>
                                        <p className="text-sm text-slate-500">Experience points (XP) provide visible indicators of effort and advancement.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary font-bold z-10">3</div>
                                    </div>
                                    <div>
                                        <h4 className="font-display font-bold text-lg">Consistency Rewards</h4>
                                        <p className="text-sm text-slate-500">Special bonuses and recognition for maintaining streaks over time.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-72 bg-card-dark border border-white/10 rounded-2xl p-4 shadow-2xl">
                            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                <span className="text-[10px] font-bold tracking-widest text-slate-500">
                                  {new Date().toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase()}
                                </span>
                                <span className="material-symbols-rounded text-primary text-sm">calendar_today</span>
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                <div className="text-[8px] text-center font-bold text-slate-600">M</div>
                                <div className="text-[8px] text-center font-bold text-slate-600">T</div>
                                <div className="text-[8px] text-center font-bold text-slate-600">W</div>
                                <div className="text-[8px] text-center font-bold text-slate-600">T</div>
                                <div className="text-[8px] text-center font-bold text-slate-600">F</div>
                                <div className="text-[8px] text-center font-bold text-slate-600">S</div>
                                <div className="text-[8px] text-center font-bold text-slate-600">S</div>
                                {/* streak visualisation: show last streak days as checked */}
                                {Array.from({ length: Math.min(streak, 5) }).map((_, i) => (
                                  <div key={`streak-${i}`} className="aspect-square bg-primary/20 rounded flex items-center justify-center border border-primary/40">
                                    <span className="material-symbols-rounded text-primary text-xs">check</span>
                                  </div>
                                ))}
                                {/* today – fire icon */}
                                {streak > 0 && (
                                  <div className="aspect-square bg-primary/80 rounded flex items-center justify-center border border-primary/100 shadow-[0_0_10px_rgba(255,107,0,0.5)]">
                                    <span className="material-symbols-rounded text-white text-xs">local_fire_department</span>
                                  </div>
                                )}
                                {/* remaining placeholder cells */}
                                {Array.from({ length: Math.max(0, 7 - Math.min(streak, 5) - (streak > 0 ? 1 : 0)) }).map((_, i) => (
                                  <div key={`empty-${i}`} className="aspect-square bg-white/5 rounded flex items-center justify-center border border-white/5 text-[10px] text-slate-500">
                                    {Math.min(streak, 5) + (streak > 0 ? 1 : 0) + i + 1}
                                  </div>
                                ))}
                            </div>
                            <div className="mt-6 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-rounded text-primary">military_tech</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-primary tracking-widest uppercase">Next Milestone</p>
                                    <p className="text-xs font-bold">
                                      {streak < 7 ? "7" : streak < 14 ? "14" : streak < 30 ? "30" : "60"} Day Master Streak
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* ── sidebar ── */}
            <div className="space-y-8">
                {/* ── leaderboard ── */}
                <div className="glass-card dark:bg-card-dark p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-display font-bold">Leaderboard</h2>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Weekly Growth</span>
                    </div>
                    <div className="space-y-4">
                        {top3.map((entry) => (
                          <div
                            key={entry.rank}
                            className={`flex items-center justify-between p-2 rounded-xl ${
                              entry.isYou
                                ? "bg-primary/10 border border-primary/20"
                                : entry.rank === 1
                                ? "bg-primary/10 border border-primary/20"
                                : "bg-white/5 border border-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold w-4 text-center ${entry.rank === 1 || entry.isYou ? "text-primary" : "text-slate-500"}`}>
                                  {entry.rank}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${entry.isYou ? "bg-primary/30 text-primary ring-2 ring-primary/50" : "bg-slate-800 text-slate-300"}`}>
                                  {entry.isYou ? firstName.charAt(0) : `#${entry.rank}`}
                                </div>
                                <span className={`text-sm font-bold ${entry.isYou ? "text-primary" : ""}`}>
                                  {entry.isYou ? "You" : `Player ${entry.rank}`}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">{formatXP(entry.eligibleXP)} XP</span>
                          </div>
                        ))}

                        {/* Show "You" row if not already in top 3 */}
                        {myRank && myRank > 3 && (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-primary w-4 text-center">{myRank}</span>
                                <div className="w-8 h-8 rounded-full bg-primary/30 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-primary/50">
                                  {firstName.charAt(0)}
                                </div>
                                <span className="text-sm font-bold text-primary">You</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">{formatXP(totalXP)} XP</span>
                          </div>
                        )}
                    </div>
                    <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-colors uppercase tracking-widest">Full Rankings</button>
                </div>

                {/* ── wallet / currency ── */}
                <div className="glass-card dark:bg-card-dark p-6 rounded-2xl border border-white/5">
                    <h2 className="text-lg font-display font-bold mb-6">Wallet</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                            <span className="material-symbols-rounded text-yellow-400 text-2xl">paid</span>
                            <span className="text-lg font-bold mt-1">{coins.toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Coins</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <span className="material-symbols-rounded text-blue-400 text-2xl">diamond</span>
                            <span className="text-lg font-bold mt-1">{diamonds.toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Diamonds</span>
                        </div>
                    </div>
                </div>

                {/* ── badges (static – no badge endpoint yet) ── */}
                <div className="glass-card dark:bg-card-dark p-6 rounded-2xl border border-white/5">
                    <h2 className="text-lg font-display font-bold mb-6">Recent Badges</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="group relative flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-300 p-0.5 shadow-lg shadow-orange-500/20">
                                <div className="w-full h-full rounded-full bg-card-dark flex items-center justify-center">
                                    <span className="material-symbols-rounded text-orange-400">rocket</span>
                                </div>
                            </div>
                            <span className="text-[9px] mt-2 font-bold text-slate-500 text-center uppercase leading-tight">First Launch</span>
                        </div>
                        <div className="group relative flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-300 p-0.5 shadow-lg shadow-purple-500/20">
                                <div className="w-full h-full rounded-full bg-card-dark flex items-center justify-center">
                                    <span className="material-symbols-rounded text-purple-400">stars</span>
                                </div>
                            </div>
                            <span className="text-[9px] mt-2 font-bold text-slate-500 text-center uppercase leading-tight">All Stars</span>
                        </div>
                        <div className="group relative flex flex-col items-center opacity-40 grayscale">
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                                <span className="material-symbols-rounded text-white/20">lock</span>
                            </div>
                            <span className="text-[9px] mt-2 font-bold text-slate-500 text-center uppercase leading-tight">???</span>
                        </div>
                    </div>
                </div>

                {/* ── quote ── */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
                    <span className="material-symbols-rounded text-primary/40 text-4xl block mb-2">format_quote</span>
                    <p className="text-sm font-medium italic text-slate-400 mb-4">The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself.</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">&mdash; Carl Sagan</p>
                </div>
            </div>
        </div>
    </main>

    {/* ── mobile bottom nav ── */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-white/10 px-6 py-3 pb-safe flex justify-between items-center">
        <Link href="/dashboard" className="flex flex-col items-center gap-1">
            <span className="material-symbols-rounded text-primary">grid_view</span>
            <span className="text-[10px] font-bold text-primary">Home</span>
        </Link>
        <Link href="/subjects" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-rounded">school</span>
            <span className="text-[10px] font-bold">Learn</span>
        </Link>
        <button onClick={handlePlay} className="bg-primary -mt-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-105 transition-transform">
            <span className="material-symbols-rounded text-white">play_arrow</span>
        </button>
        <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-rounded">leaderboard</span>
            <span className="text-[10px] font-bold">Rank</span>
        </Link>
        <Link href="/completeprofile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-rounded">person</span>
            <span className="text-[10px] font-bold">Profile</span>
        </Link>
    </div>

    {/* ── side drawer ── */}
    {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}></div>
            <div className="relative w-64 h-full bg-background-dark border-l border-white/10 flex flex-col p-6 animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-orange">MENU</span>
                    <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-primary">
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>
                <div className="flex flex-col gap-4 flex-1">
                    <Link href="/dashboard" className="flex items-center gap-3 text-lg font-medium text-slate-200 hover:text-primary transition-colors">
                        <span className="material-symbols-rounded">dashboard</span> Dashboard
                    </Link>
                    <Link href="/subjects" className="flex items-center gap-3 text-lg font-medium text-slate-200 hover:text-primary transition-colors">
                        <span className="material-symbols-rounded">school</span> Courses
                    </Link>
                    <Link href="/analytics" className="flex items-center gap-3 text-lg font-medium text-slate-200 hover:text-primary transition-colors">
                        <span className="material-symbols-rounded">monitoring</span> Analytics
                    </Link>
                    <Link href="/leaderboard" className="flex items-center gap-3 text-lg font-medium text-slate-200 hover:text-primary transition-colors">
                        <span className="material-symbols-rounded">leaderboard</span> Leaderboard
                    </Link>
                    <Link href="/completeprofile" className="flex items-center gap-3 text-lg font-medium text-slate-200 hover:text-primary transition-colors">
                        <span className="material-symbols-rounded">person</span> Profile
                    </Link>
                </div>
                <div className="mt-auto border-t border-white/10 pt-4">
                    <button onClick={() => { localStorage.removeItem("accessToken"); router.push("/login"); }} className="flex items-center w-full gap-3 text-lg font-medium text-red-500 hover:text-red-400 transition-colors">
                        <span className="material-symbols-rounded">logout</span> Logout
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
}
