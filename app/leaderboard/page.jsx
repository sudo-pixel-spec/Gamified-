"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { getToken, apiFetch } from "../../lib/api";

// ── API Response shapes ──────────────────────────────────────────────────────
// GET /v1/leaderboards/weekly-growth
// GET /v1/leaderboards/mastery
// Both return: { ok, data: { weekStart, type, entries: Entry[] } }
// Entry: { userId, score, lessonsCompleted, eligibleXP, accuracy, activeDays, hardPerfectCount }
//
// NOTE: The backend does NOT return displayName/avatar in leaderboard entries.
// Only the logged-in user can be identified by matching userId to GET /v1/me → id.
// Other users show anonymised avatars derived from their userId.
// ─────────────────────────────────────────────────────────────────────────────

const MILESTONES = [
  { icon: "hotel_class",          title: "Supernova",     desc: "Reach Level 50" },
  { icon: "local_fire_department", title: "Comet Streak", desc: "30 Day Consistency" },
  { icon: "diamond",              title: "XP Miner",      desc: "Earn 50k Total XP" },
  { icon: "groups",               title: "Squad Leader",  desc: "Top 10 in Season" },
];

function pctColor(pct) {
  const p = Math.round(pct * 100);
  if (p >= 75) return "text-green-400";
  if (p >= 50) return "text-yellow-400";
  return "text-red-400";
}

// Generate a deterministic pastel-like colour class from a userId string
const AVATAR_COLORS = [
  "bg-blue-500/30 text-blue-300",
  "bg-purple-500/30 text-purple-300",
  "bg-emerald-500/30 text-emerald-300",
  "bg-amber-500/30 text-amber-300",
  "bg-rose-500/30 text-rose-300",
  "bg-cyan-500/30 text-cyan-300",
];
function avatarColor(userId) {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// Shorten userId to readable display: last 6 hex chars, uppercase
function shortId(userId) {
  return userId.slice(-6).toUpperCase();
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [tab,      setTab]      = useState("weekly");
  const [weekly,   setWeekly]   = useState([]);
  const [mastery,  setMastery]  = useState([]);
  const [myId,     setMyId]     = useState(null);
  const [myName,   setMyName]   = useState("You");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }

    setLoading(true);
    setError("");

    Promise.allSettled([
      // GET /v1/me — to identify which entry is "You"
      apiFetch(`/v1/me`),
      // GET /v1/leaderboards/weekly-growth
      // Returns: { weekStart, type, entries: [{ userId, score, lessonsCompleted, eligibleXP, accuracy, activeDays, hardPerfectCount }] }
      apiFetch(`/v1/leaderboards/weekly-growth`),
      // GET /v1/leaderboards/mastery  (same shape)
      apiFetch(`/v1/leaderboards/mastery`),
    ]).then(([meRes, wRes, mRes]) => {
      // Identify the logged-in user
      const me = meRes.value ?? {};
      if (me?.id || me?._id) {
        setMyId(String(me?.id ?? me?._id));
        setMyName(me?.profile?.fullName?.split(" ")[0] || "You");
      }

      // Parse weekly entries
      const wRaw = wRes?.value?.entries ?? [];
      const mRaw = mRes?.value?.entries ?? [];

      // Add rank field
      setWeekly(wRaw.map((e, i) => ({ ...e, rank: i + 1 })));
      setMastery(mRaw.map((e, i) => ({ ...e, rank: i + 1 })));

      if (!wRaw.length && !mRaw.length) {
        setError("No rankings available yet this week. Complete some quizzes to appear here!");
      }
    }).catch(err => {
      setError("Failed to load leaderboard. Please try again.");
      console.error(err);
    }).finally(() => setLoading(false));
  }, [router]);

  const rows = tab === "weekly" ? weekly : mastery;
  const myRank = rows.find(r => r.userId === myId)?.rank ?? null;

  const handleBack = useCallback(() => router.push("/dashboard"), [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF6B00]/30 border-t-[#FF6B00] rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading the Leaderboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />

      <style>{`
        .lb-bg {
          background-color:#050505;
          background-image:
            radial-gradient(circle at 20% 30%,rgba(255,107,0,.05) 0%,transparent 40%),
            radial-gradient(circle at 80% 70%,rgba(255,107,0,.08) 0%,transparent 40%);
        }
        .glass { background:rgba(255,255,255,.03); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.05); }
        .user-hl { box-shadow:0 0 20px rgba(255,107,0,.25); border:1px solid rgba(255,107,0,.5) !important; }
        .glow-icon { filter:drop-shadow(0 0 8px rgba(255,107,0,.6)); }
        .fdisplay { font-family:'Rajdhani',sans-serif; }
      `}</style>

      <div className="lb-bg min-h-screen text-slate-100 pb-24" style={{ fontFamily: "'Inter',sans-serif" }}>

        {/* Decorative blobs */}
        <div className="fixed top-10 right-10 opacity-20 pointer-events-none animate-pulse">
          <div className="w-24 md:w-48 h-24 md:h-48 rounded-full bg-gradient-to-br from-[#FF6B00]/60 to-orange-900/20 blur-sm" />
        </div>
        <div className="fixed bottom-20 left-10 opacity-10 pointer-events-none">
          <span className="material-icons-outlined text-[#FF6B00]" style={{ fontSize: "9rem" }}>auto_awesome</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">

          {/* ── Header ── */}
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <button onClick={handleBack} className="flex items-center gap-1.5 text-slate-400 hover:text-[#FF6B00] text-sm mb-3 transition-colors">
                <span className="material-icons-outlined text-base">arrow_back</span>
                Back to Dashboard
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-icons-outlined text-[#FF6B00] glow-icon">leaderboard</span>
                <span className="uppercase tracking-widest text-sm font-bold text-[#FF6B00] fdisplay">Weekly Season</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold fdisplay tracking-tight">
                Student <span className="text-[#FF6B00]">Leaderboard</span>
              </h1>
            </div>
            <div className="flex gap-4">
              <div className="glass px-6 py-3 rounded-2xl text-center min-w-[120px]">
                <p className="text-xs uppercase tracking-tighter text-slate-400">Participants</p>
                <p className="text-2xl font-bold fdisplay">{rows.length}</p>
              </div>
              {myRank && (
                <div className="glass px-6 py-3 rounded-2xl text-center min-w-[120px] border border-[#FF6B00]/30">
                  <p className="text-xs uppercase tracking-tighter text-[#FF6B00]">Your Rank</p>
                  <p className="text-2xl font-bold fdisplay text-[#FF6B00]">#{myRank}</p>
                </div>
              )}
            </div>
          </header>

          {/* ── Tab switcher ── */}
          <div className="flex gap-2 mb-6">
            {[
              ["weekly",  "Weekly Growth", "trending_up"],
              ["mastery", "Mastery",       "military_tech"],
            ].map(([key, label, icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all fdisplay tracking-wide ${
                  tab === key
                    ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/25"
                    : "glass text-slate-400 hover:text-white"
                }`}
              >
                <span className="material-icons-outlined text-base">{icon}</span>
                {label}
              </button>
            ))}
            <button onClick={() => router.push("/subjects")} className="ml-auto glass px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
              <span className="material-icons-outlined text-base">school</span>
              <span className="hidden md:inline">Courses</span>
            </button>
          </div>

          {/* ── Error / Empty state ── */}
          {error && (
            <div className="glass rounded-2xl p-10 text-center mb-6">
              <span className="material-icons-outlined text-slate-600 text-5xl mb-3 block">leaderboard</span>
              <p className="text-slate-400">{error}</p>
              <button onClick={() => router.push("/subjects")} className="mt-4 px-6 py-2 bg-[#FF6B00] text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors">
                Start Learning
              </button>
            </div>
          )}

          {/* ── Table ── */}
          {rows.length > 0 && (
            <div className="glass rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-5 fdisplay uppercase tracking-wider text-sm font-semibold text-slate-400">Rank</th>
                      <th className="px-6 py-5 fdisplay uppercase tracking-wider text-sm font-semibold text-slate-400">Student</th>
                      <th className="px-6 py-5 fdisplay uppercase tracking-wider text-sm font-semibold text-slate-400 text-center">
                        {tab === "weekly" ? "XP" : "Lessons"}
                      </th>
                      <th className="px-6 py-5 fdisplay uppercase tracking-wider text-sm font-semibold text-slate-400 text-center">Accuracy</th>
                      <th className="px-6 py-5 fdisplay uppercase tracking-wider text-sm font-semibold text-slate-400 text-center">Active Days</th>
                      <th className="px-6 py-5 fdisplay uppercase tracking-wider text-sm font-semibold text-slate-400 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.map((row) => {
                      const isMe = row.userId === myId;
                      const medal = row.rank === 1 ? "gold" : row.rank === 2 ? "silver" : row.rank === 3 ? "bronze" : null;
                      const medalIcon = medal === "gold"
                        ? <span className="material-icons-outlined text-yellow-400 text-base ml-1">workspace_premium</span>
                        : null;
                      const rankClass =
                        medal === "gold"   ? "text-yellow-400" :
                        medal === "silver" ? "text-slate-400"  :
                        medal === "bronze" ? "text-amber-700"  :
                        isMe               ? "text-[#FF6B00]"  : "text-slate-500";
                      const aColor = isMe ? "bg-[#FF6B00]/30 text-[#FF6B00] border-[#FF6B00]" : avatarColor(row.userId);

                      return (
                        <tr
                          key={row.userId}
                          className={`transition-colors ${isMe ? "user-hl bg-[#FF6B00]/10" : "hover:bg-white/5"} ${row.rank > 3 && !isMe ? "opacity-75" : ""}`}
                        >
                          {/* Rank */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className={`text-2xl font-bold fdisplay ${rankClass}`}>
                                {String(row.rank).padStart(2, "0")}
                              </span>
                              {medalIcon}
                            </div>
                          </td>

                          {/* Student */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold ${aColor}`}>
                                  {isMe ? myName.charAt(0).toUpperCase() : shortId(row.userId).charAt(0)}
                                </div>
                                {isMe && (
                                  <div className="absolute -top-1 -right-1 bg-[#FF6B00] text-[8px] font-black px-1 rounded text-white animate-bounce">YOU</div>
                                )}
                              </div>
                              <div>
                                <span className={`font-semibold text-sm block ${isMe ? "text-[#FF6B00] font-bold" : ""}`}>
                                  {isMe ? myName : `Player ${shortId(row.userId)}`}
                                </span>
                                <span className="text-[10px] text-slate-500">{row.lessonsCompleted} lessons</span>
                              </div>
                            </div>
                          </td>

                          {/* XP / Lessons */}
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold fdisplay text-lg ${isMe ? "text-[#FF6B00]" : ""}`}>
                              {tab === "weekly"
                                ? (row.eligibleXP?.toLocaleString() ?? "—") + " XP"
                                : row.lessonsCompleted ?? "—"}
                            </span>
                          </td>

                          {/* Accuracy */}
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold text-sm ${pctColor(row.accuracy ?? 0)}`}>
                              {row.accuracy != null ? Math.round(row.accuracy * 100) + "%" : "—"}
                            </span>
                          </td>

                          {/* Active days */}
                          <td className="px-6 py-4 text-center">
                            <div className={`flex items-center justify-center gap-1 font-bold text-sm ${isMe ? "text-[#FF6B00]" : "text-slate-400"}`}>
                              <span className="material-icons-outlined text-sm">calendar_today</span>
                              {row.activeDays ?? 0}
                            </div>
                          </td>

                          {/* Score */}
                          <td className={`px-6 py-4 text-right fdisplay text-xl font-bold ${isMe ? "text-[#FF6B00]" : ""}`}>
                            {(row.score ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          {rows.length > 0 && (
            <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-sm text-slate-500">
                {myRank
                  ? `You are ranked #${myRank} out of ${rows.length} participants this week.`
                  : `${rows.length} participants ranked this week. Complete quizzes to join the rankings!`}
              </p>
              <button
                onClick={() => router.push("/subjects")}
                className="bg-[#FF6B00] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-[#FF6B00]/20 fdisplay tracking-wide"
              >
                <span className="material-icons-outlined">play_arrow</span>
                START LEARNING
              </button>
            </div>
          )}

          {/* ── Milestones ── */}
          <div className="mt-16">
            <h3 className="fdisplay text-2xl font-bold mb-6 flex items-center gap-2 uppercase tracking-wide">
              <span className="material-icons-outlined text-[#FF6B00]">military_tech</span>
              Featured Milestones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MILESTONES.map(({ icon, title, desc }) => (
                <div key={title} className="glass p-6 rounded-3xl flex items-center gap-4 group cursor-pointer hover:border-[#FF6B00]/40 transition-all">
                  <div className="bg-[#FF6B00]/10 p-3 rounded-2xl group-hover:bg-[#FF6B00]/20 transition-colors">
                    <span className="material-icons-outlined text-3xl text-[#FF6B00]">{icon}</span>
                  </div>
                  <div>
                    <p className="font-bold fdisplay text-lg">{title}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}