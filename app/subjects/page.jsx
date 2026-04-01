"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { getToken, apiFetch } from "../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

// Multi-color palette — synced with Dashboard
const SUBJECT_COLOR_MAP = [
  { bg: "bg-blue-500/10",    text: "text-blue-400",    badge: "bg-blue-500/20 text-blue-300 border-blue-500/20",       icon: "functions" },
  { bg: "bg-purple-500/10",  text: "text-purple-400",  badge: "bg-purple-500/20 text-purple-300 border-purple-500/20",  icon: "biotech" },
  { bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20", icon: "language" },
  { bg: "bg-amber-500/10",   text: "text-amber-400",   badge: "bg-amber-500/20 text-amber-300 border-amber-500/20",    icon: "history_edu" },
  { bg: "bg-rose-500/10",    text: "text-rose-400",    badge: "bg-rose-500/20 text-rose-300 border-rose-500/20",       icon: "palette" },
  { bg: "bg-cyan-500/10",    text: "text-cyan-400",    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/20",       icon: "computer" },
];

export default function SubjectsPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [me, setMe]           = useState(null);

  useEffect(() => {
    if (authLoading) return;
    const token = getToken();
    if (!token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const meRes = await apiFetch("/v1/me");
        const meData = meRes?.data || meRes;
        if (!cancelled) setMe(meData);
        
        const stdKey = meData?.profile?.standard;
        if (!stdKey) { setSubjects([]); return; }

        // Using same admin route as dashboard for subjects parity
        const dataResponse = await apiFetch(`/v1/admin/subjects?standard=${encodeURIComponent(stdKey)}`);
        const data = dataResponse?.data || dataResponse;
        const list = Array.isArray(data) ? data : (data?.items ?? data?.subjects ?? []);
        if (!cancelled) setSubjects(list);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load subjects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-white/50">Loading courses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-8">
      {/* Background glow */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-white/5 border border-transparent hover:border-orange-500/20 transition-colors"
          >
            <span className="material-symbols-rounded text-white">arrow_back</span>
          </button>
          <h1 className="text-2xl font-display font-bold text-white">My Courses</h1>
        </div>
        <span className="text-xs font-bold text-primary uppercase tracking-widest">{subjects.length} Subjects</span>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {subjects.length === 0 && !error && (
          <div className="text-center py-20 space-y-3">
            <span className="material-symbols-outlined text-white/20 text-6xl">school</span>
            <p className="text-white/40">No subjects found for your standard yet.</p>
            <button onClick={() => router.push("/dashboard")} className="text-primary font-bold text-sm hover:underline">
              ← Back to Dashboard
            </button>
          </div>
        )}

        {subjects.map((sub, i) => {
          const c = SUBJECT_COLOR_MAP[i % SUBJECT_COLOR_MAP.length];
          const subjectId = sub._id || sub.id;
          const label = (sub.name || sub.title || "Subject").toUpperCase();

          return (
            <button
              key={subjectId || i}
              type="button"
              onClick={() => subjectId && router.push(`/structure?subjectId=${encodeURIComponent(subjectId)}`)}
              disabled={!subjectId}
              className="w-full text-left bg-[#141414] border border-white/5 p-6 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${c.bg} rounded-xl group-hover:scale-105 transition-transform`}>
                  <span className={`material-symbols-rounded ${c.text}`}>{c.icon}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-black px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white/40 uppercase tracking-widest whitespace-nowrap">
                     Grade {sub.standardCode || sub.standard?.code || me?.profile?.standard || "—"}
                   </span>
                   <span className={`text-[10px] font-bold px-2 py-1 ${c.badge} rounded border uppercase truncate max-w-[100px]`}>{label}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-xl group-hover:text-primary transition-colors text-white mb-2">
                  {sub.name || sub.title || "Subject"}
                </h2>
                <p className="text-sm text-white/50 mb-6 line-clamp-2 leading-relaxed">
                  {sub.description || "Continue your learning journey in this subject."}
                </p>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white/40">{sub.lessonCount ? `${sub.lessonCount} Lessons` : "View Lessons"}</span>
                  <div className="flex items-center gap-1 text-primary">
                    <span>{subjectId ? "START" : "UNAVAILABLE"}</span>
                    <span className="material-symbols-rounded text-sm">arrow_forward</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </main>
    </div>
  );
}
