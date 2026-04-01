"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiFetch, getToken } from "../../lib/api";
import { getStudentStandards, resolveStandardCodeToId } from "../../lib/curriculum-api";
import Image from "next/image";

function formatXP(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

const SUBJECT_COLOR_MAP = [
  { bg: "bg-blue-500/10",    text: "text-blue-400",    badge: "bg-blue-500/20 text-blue-300 border-blue-500/20",       icon: "functions" },
  { bg: "bg-purple-500/10",  text: "text-purple-400",  badge: "bg-purple-500/20 text-purple-300 border-purple-500/20",  icon: "biotech" },
  { bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20", icon: "language" },
  { bg: "bg-amber-500/10",   text: "text-amber-400",   badge: "bg-amber-500/20 text-amber-300 border-amber-500/20",    icon: "history_edu" },
  { bg: "bg-rose-500/10",    text: "text-rose-400",    badge: "bg-rose-500/20 text-rose-300 border-rose-500/20",       icon: "palette" },
  { bg: "bg-cyan-500/10",    text: "text-cyan-400",    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/20",       icon: "computer" },
];

export default function Dashboard() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showStandardPrompt, setShowStandardPrompt] = useState(false);
  const [availableStandards, setAvailableStandards] = useState([]);
  const [standardLoading, setStandardLoading] = useState(false);

  // Fetch subjects helper
  const fetchSubjects = async (stdId) => {
    if (!stdId) return;
    try {
      // Step 1: Ensure we have the ObjectId (bridge legacy codes)
      const resolvedId = await resolveStandardCodeToId(stdId);
      console.log("🔍 Fetching subjects for Standard ID:", resolvedId);
      
      // Step 2: Fetch using the resolved ID
      const subRes = await apiFetch(`/v1/curriculum/subjects?standardId=${encodeURIComponent(resolvedId)}`);
      const subData = subRes?.data || subRes;
      const subjectsArray = Array.isArray(subData) ? subData : subData?.subjects ?? [];
      
      console.log(`📚 Subjects found for ${resolvedId}:`, subjectsArray.length);
      setSubjects(subjectsArray);
    } catch (e) {
      console.error("Fetch subjects failed:", e);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [meRes, growthRes] = await Promise.all([
          apiFetch("/v1/me"),
          apiFetch("/v1/leaderboards/weekly-growth")
        ]);
        if (cancelled) return;

        const meData = meRes?.data || meRes;
        const growthData = growthRes?.data || growthRes;

        if (!meData?.profileComplete) { 
          router.replace("/completeprofile"); 
          return; 
        }

        setMe(meData);
        setGrowth(growthData?.entries || []);

        // Use the 'standard' field to check for configuration. 
        // Our workaround saves the ID directly here.
        const stdRaw = meData?.profile?.standard;
        if (stdRaw) {
          await fetchSubjects(stdRaw);
        } else {
          // No configuration found, show prompt
          setShowStandardPrompt(true);
        }
      } catch (e) {
        console.error("Dashboard init failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, router]);

  // Handle Standard Change from Prompt
  const handleStandardSelect = async (std) => {
    setStandardLoading(true);
    try {
      // Use Onboarding route to bypass strict literal validation on the Profile route
      await apiFetch("/v1/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: me?.profile?.fullName || "Learner",
          standard: std._id, // Save the ID directly to the standard field
          timezone: me?.profile?.timezone || "Asia/Kolkata",
        }),
      });
      // Update local state and fetch new content
      // We store the ID in the 'standard' field to pass backend validation in the future.
      setMe(prev => ({ ...prev, profile: { ...prev.profile, standard: std._id } }));
      await fetchSubjects(std._id);
      setShowStandardPrompt(false);
    } catch (e) {
      console.error("Standard update failed:", e);
    } finally {
      setStandardLoading(false);
    }
  };

  // Debug log for checking standard ID in browser console
  useEffect(() => {
    if (me?.profile?.standard) {
      console.log("🛠️ Current Dashboard Standard ID:", me.profile.standard);
    }
  }, [me]);

  // Load standards list once when prompt is needed
  useEffect(() => {
    if (showStandardPrompt && availableStandards.length === 0) {
      getStudentStandards().then(async (res) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setAvailableStandards(list);

        // Fetch counts for each standard to help user pick the "full" one
        const enriched = [...list];
        for (let i = 0; i < enriched.length; i++) {
          const std = enriched[i];
          const stdId = std._id || std.id;
          try {
            const subRes = await apiFetch(`/v1/curriculum/subjects?standardId=${stdId}`);
            const subjects = subRes?.data || subRes || [];
            let totalLessons = 0;
            for (const sub of subjects) {
              const unitRes = await apiFetch(`/v1/units?subjectId=${sub._id || sub.id}`);
              const units = unitRes?.data || unitRes || [];
              for (const unit of units) {
                const chapRes = await apiFetch(`/v1/chapters?unitId=${unit._id || unit.id}`);
                const chapters = chapRes?.data || chapRes || [];
                for (const chap of chapters) {
                  const lessonRes = await apiFetch(`/v1/lessons?chapterId=${chap._id || chap.id}`);
                  const lessons = lessonRes?.data || lessonRes || [];
                  totalLessons += lessons.length;
                }
              }
            }
            enriched[i] = { ...std, lessonCount: totalLessons };
            setAvailableStandards([...enriched]);
          } catch (e) {
            console.error("Count enrichment failed for", stdId, e);
          }
        }
      });
    }
  }, [showStandardPrompt]);



  const name        = me?.profile?.fullName || "Learner";
  const firstName   = name.split(" ")[0];
  const level       = me?.level ?? 1;
  const totalXP     = me?.totalXP ?? 0;
  const xpPerLevel  = 500;
  const xpInLevel   = totalXP % xpPerLevel;
  const xpNeeded    = xpPerLevel - xpInLevel;
  const progressPct = Math.round((xpInLevel / xpPerLevel) * 100);
  const streak      = me?.streakCount ?? 0;
  const coins       = me?.wallet?.coins ?? 0;
  const diamonds    = me?.wallet?.diamonds ?? 0;

  const top3 = useMemo(() => {
    return growth.slice(0, 3).map((e, i) => ({
      rank: i + 1,
      name: e.userId,
      score: e.score,
      eligibleXP: e.eligibleXP,
      isYou: me?.id === e.userId,
    }));
  }, [growth, me]);

  const myRank = useMemo(() => {
    if (!me?.id) return null;
    const i = growth.findIndex((x) => x.userId === me.id);
    return i >= 0 ? i + 1 : null;
  }, [growth, me]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-900/10 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">

        {/* hero + level card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 flex flex-col justify-center">
            <h1 className="text-4xl font-display font-bold mb-2 text-white flex flex-wrap items-center gap-x-4">
              Welcome back, <span className="text-primary">{firstName}</span>.
              <button 
                onClick={() => setShowStandardPrompt(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all group"
              >
                <span className="material-symbols-rounded text-sm">school</span>
                Grade Select
              </button>
            </h1>
            <p className="text-white/60 text-lg">Your learning voyage continues. Today&apos;s goal: 500 XP.</p>
          </div>
          <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Current Status</p>
                <h3 className="text-xl font-display font-bold text-white">Level {level} <span className="text-white/40 font-normal">/ {level + 1}</span></h3>
              </div>
              <p className="text-sm font-bold text-primary">{xpInLevel} / {xpPerLevel} XP</p>
            </div>
            <div className="h-3 w-full bg-[#222] rounded-full overflow-hidden border border-orange-500/10">
              <div className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full shadow-[0_0_15px_rgba(255,107,0,0.4)]" style={{ width: `${progressPct}%` }}></div>
            </div>
            <p className="text-[10px] text-white/40 mt-4 text-center">{xpNeeded} XP to reach <span className="text-white/70 font-semibold">Level {level + 1}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">

            {/* quick actions — keep original distinct colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/subjects" className="bg-[#141414] border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 p-6 rounded-2xl transition-all duration-200 flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <span className="material-symbols-rounded">school</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Browse Courses</h3>
                  <p className="text-xs text-blue-300/70">Explore subjects and lessons</p>
                </div>
              </Link>
              <Link href="/analytics" className="bg-[#141414] border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 p-6 rounded-2xl transition-all duration-200 flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <span className="material-symbols-rounded">monitoring</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">View Analytics</h3>
                  <p className="text-xs text-emerald-300/70">Track your progress stats</p>
                </div>
              </Link>
            </div>

            {/* My Subjects section — renamed from Daily Revision as these are the subjects/courses */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold flex items-center gap-2 text-white">
                  <span className="material-symbols-rounded text-primary">auto_stories</span>
                  My Subjects
                </h2>
                <Link className="text-xs font-bold text-primary hover:underline" href="/subjects">VIEW ALL</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.length === 0 ? (
                  <div className="bg-[#141414] border border-orange-500/10 p-12 rounded-[2.5rem] text-center flex flex-col items-center justify-center min-h-[300px] w-full col-span-2">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                      <span className="material-symbols-rounded text-3xl text-white/20">search_off</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No subjects found.</h3>
                    <p className="text-sm text-white/30 max-w-xs mb-8 italic">It seems no learning paths are assigned to your current grade ID.</p>
                    <button 
                      onClick={() => setShowStandardPrompt(true)}
                      className="px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Change Your Grade
                    </button>
                  </div>
                ) : (
                  subjects.map((sub, i) => {
                    const c = SUBJECT_COLOR_MAP[i % SUBJECT_COLOR_MAP.length];
                    const subjectId = sub._id || sub.id;
                    const label = (sub.name || sub.title || "Subject").toUpperCase();

                    return (
                      <button
                        key={subjectId || i}
                        type="button"
                        onClick={() => {
                          if (subjectId) router.push(`/structure?subjectId=${encodeURIComponent(subjectId)}`);
                        }}
                        disabled={!subjectId}
                        className="bg-[#141414] border border-white/5 p-6 rounded-2xl group cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-left w-full disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 ${c.bg} rounded-xl`}>
                            <span className={`material-symbols-rounded ${c.text}`}>{c.icon}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white/40 uppercase tracking-widest whitespace-nowrap">
                               Grade {sub.standardCode || sub.standard?.code || me?.profile?.standard || "—"}
                             </span>
                             <span className={`text-[10px] font-bold px-2 py-1 ${c.badge} rounded border uppercase`}>{label}</span>
                          </div>
                        </div>
                        <h4 className="text-lg font-display font-semibold mb-2 text-white group-hover:text-primary transition-colors">{sub.name || sub.title}</h4>
                        <p className="text-sm text-white/50 mb-6">{sub.description || "Continue your learning journey."}</p>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-white/40">{sub.lessonCount ? `${sub.lessonCount} Lessons` : ""}</span>
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

            {/* habit engine */}
            <section className="bg-primary/5 border border-primary/20 p-8 rounded-3xl overflow-hidden relative">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h2 className="text-2xl font-display font-bold mb-4 text-white">The Habit Engine</h2>
                  <p className="text-white/50 mb-8 max-w-md text-sm leading-relaxed">By gamifying consistency, we help you develop vital self-discipline and a continuous learning mindset.</p>
                  <div className="space-y-8">
                    {[
                      { n: 1, title: "Daily Learning Streaks", desc: "Encourages consistent engagement, turning learning into a daily habit." },
                      { n: 2, title: "XP & Levels", desc: "Experience points (XP) provide visible indicators of effort and advancement." },
                      { n: 3, title: "Consistency Rewards", desc: "Special bonuses and recognition for maintaining streaks over time." },
                    ].map(({ n, title, desc }) => (
                      <div key={n} className="flex gap-6 relative">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary font-bold z-10">{n}</div>
                          {n < 3 && <div className="w-0.5 h-full bg-primary/20 absolute top-10"></div>}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-lg text-white">{title}</h4>
                          <p className="text-sm text-white/50">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-72 bg-[#111] border border-orange-500/20 rounded-2xl p-4 shadow-2xl">
                  <div className="flex justify-between items-center mb-4 border-b border-orange-500/10 pb-2">
                    <span className="text-[10px] font-bold tracking-widest text-white/40">
                      {new Date().toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase()}
                    </span>
                    <span className="material-symbols-rounded text-primary text-sm">calendar_today</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {["M","T","W","T","F","S","S"].map((d, i) => (
                      <div key={i} className="text-[8px] text-center font-bold text-white/30">{d}</div>
                    ))}
                    {Array.from({ length: Math.min(streak, 5) }).map((_, i) => (
                      <div key={`streak-${i}`} className="aspect-square bg-primary/20 rounded flex items-center justify-center border border-primary/40">
                        <span className="material-symbols-rounded text-primary text-xs">check</span>
                      </div>
                    ))}
                    {streak > 0 && (
                      <div className="aspect-square bg-primary/80 rounded flex items-center justify-center border border-primary shadow-[0_0_10px_rgba(255,107,0,0.5)]">
                        <span className="material-symbols-rounded text-white text-xs">local_fire_department</span>
                      </div>
                    )}
                    {Array.from({ length: Math.max(0, 7 - Math.min(streak, 5) - (streak > 0 ? 1 : 0)) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square bg-white/5 rounded flex items-center justify-center border border-white/5 text-[10px] text-white/30">
                        {Math.min(streak, 5) + (streak > 0 ? 1 : 0) + i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-3 bg-white/5 rounded-xl border border-orange-500/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-rounded text-primary">military_tech</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-primary tracking-widest uppercase">Next Milestone</p>
                      <p className="text-xs font-bold text-white">
                        {streak < 7 ? "7" : streak < 14 ? "14" : streak < 30 ? "30" : "60"} Day Master Streak
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* sidebar */}
          <div className="space-y-8">

            {/* leaderboard */}
            <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-display font-bold text-white">Leaderboard</h2>
                <span className="text-[10px] font-bold text-white/40 uppercase">Weekly Growth</span>
              </div>
              <div className="space-y-4">
                {top3.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-2 rounded-xl ${
                      entry.isYou ? "bg-primary/10 border border-primary/30" : entry.rank === 1 ? "bg-primary/10 border border-primary/20" : "bg-white/5 border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-4 text-center ${entry.rank === 1 || entry.isYou ? "text-primary" : "text-white/40"}`}>
                        {entry.rank}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${entry.isYou ? "bg-primary/30 text-primary ring-2 ring-primary/50" : "bg-[#222] text-white/60"}`}>
                        {entry.isYou ? firstName.charAt(0) : `#${entry.rank}`}
                      </div>
                      <span className={`text-sm font-bold ${entry.isYou ? "text-primary" : "text-white/80"}`}>
                        {entry.isYou ? "You" : `Player ${entry.rank}`}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white/40">{formatXP(entry.eligibleXP)} XP</span>
                  </div>
                ))}

                {myRank && myRank > 3 && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary w-4 text-center">{myRank}</span>
                      <div className="w-8 h-8 rounded-full bg-primary/30 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-primary/50">
                        {firstName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-primary">You</span>
                    </div>
                    <span className="text-xs font-bold text-white/40">{formatXP(totalXP)} XP</span>
                  </div>
                )}
              </div>
              <button onClick={() => router.push("/leaderboard")} className="w-full mt-6 py-3 rounded-xl border border-orange-500/20 text-xs font-bold hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors uppercase tracking-widest text-white/60">
                Full Rankings
              </button>
            </div>

            {/* wallet */}
            <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-2xl">
              <h2 className="text-lg font-display font-bold mb-6 text-white">Wallet</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <span className="material-symbols-rounded text-yellow-400 text-2xl">paid</span>
                  <span className="text-lg font-bold mt-1 text-white">{coins.toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Coins</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <span className="material-symbols-rounded text-blue-400 text-2xl">diamond</span>
                  <span className="text-lg font-bold mt-1 text-white">{diamonds.toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Diamonds</span>
                </div>
              </div>
            </div>

            {/* badges */}
            <div className="bg-[#141414] border border-orange-500/20 p-6 rounded-2xl">
              <h2 className="text-lg font-display font-bold mb-6 text-white">Recent Badges</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="group relative flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-300 p-0.5 shadow-lg shadow-orange-500/30">
                    <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center">
                      <span className="material-symbols-rounded text-orange-400">rocket</span>
                    </div>
                  </div>
                  <span className="text-[9px] mt-2 font-bold text-white/40 text-center uppercase leading-tight">First Launch</span>
                </div>
                <div className="group relative flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-300 p-0.5 shadow-lg shadow-purple-500/20">
                    <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center">
                      <span className="material-symbols-rounded text-purple-400">stars</span>
                    </div>
                  </div>
                  <span className="text-[9px] mt-2 font-bold text-white/40 text-center uppercase leading-tight">All Stars</span>
                </div>
                <div className="group relative flex flex-col items-center opacity-40 grayscale">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                    <span className="material-symbols-rounded text-white/20">lock</span>
                  </div>
                  <span className="text-[9px] mt-2 font-bold text-white/40 text-center uppercase leading-tight">???</span>
                </div>
              </div>
            </div>

            {/* quote */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
              <span className="material-symbols-rounded text-primary/40 text-4xl block mb-2">format_quote</span>
              <p className="text-sm font-medium italic text-white/50 mb-4">The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself.</p>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">&mdash; Carl Sagan</p>
            </div>
          </div>
        </div>
      </main>

      {/* Select Standard Modal Prompt */}
      {showStandardPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="w-full max-w-lg bg-[#141414] border border-orange-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-primary/20 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 ring-4 ring-primary/5 shadow-[0_0_30px_rgba(255,107,0,0.2)]">
                <span className="material-symbols-rounded text-4xl text-primary animate-pulse">school</span>
              </div>
              
              <h2 className="text-3xl font-display font-black text-white tracking-tight mb-3">WELCOME TO THE ACADEMY</h2>
              <p className="text-white/50 text-sm font-medium mb-8">Please confirm your current grade level to synchronize your learning voyage.</p>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {availableStandards.length === 0 ? (
                  <div className="py-10 text-white/20 text-xs font-black uppercase tracking-widest animate-pulse">Initializing Data...</div>
                ) : (
                  availableStandards.map((std) => {
                    const isSelected = me?.profile?.standard === std.code;
                    return (
                      <button
                        key={std._id}
                        onClick={() => handleStandardSelect(std)}
                        disabled={standardLoading}
                        className={`w-full group relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
                          isSelected 
                            ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                            : 'bg-black/40 border-white/5 hover:border-primary/50 hover:bg-primary/5 text-white'
                        }`}
                      >
                        <div className="flex flex-col items-start transition-transform group-hover:translate-x-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white/80' : 'text-primary'}`}>
                              {std.code}
                            </span>
                            {std.lessonCount !== undefined && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                {std.lessonCount} Lessons
                              </span>
                            )}
                          </div>
                          <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-white/90'}`}>{std.name}</span>
                        </div>

                        <span className={`material-symbols-rounded text-2xl transition-all ${isSelected ? 'text-white scale-110' : 'text-white/20 group-hover:text-primary group-hover:scale-110'}`}>
                          {isSelected ? 'verified' : 'arrow_forward'}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>

              {standardLoading && (
                <div className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-[2.5rem]">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Synchronizing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
