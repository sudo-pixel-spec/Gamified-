"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { getToken, apiFetch } from "../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

const SUBJECT_COLORS = [
  { bg: "bg-blue-500/10",    text: "text-blue-500",    ring: "ring-blue-500/30",    icon: "functions" },
  { bg: "bg-purple-500/10",  text: "text-purple-500",  ring: "ring-purple-500/30",  icon: "biotech" },
  { bg: "bg-emerald-500/10", text: "text-emerald-500", ring: "ring-emerald-500/30", icon: "language" },
  { bg: "bg-amber-500/10",   text: "text-amber-500",   ring: "ring-amber-500/30",   icon: "history_edu" },
  { bg: "bg-rose-500/10",    text: "text-rose-500",    ring: "ring-rose-500/30",    icon: "palette" },
  { bg: "bg-cyan-500/10",    text: "text-cyan-500",    ring: "ring-cyan-500/30",    icon: "computer" },
];

export default function SubjectsPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (authLoading) return;
    const token = getToken();
    if (!token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        // Get user's standard first
        const me = await apiFetch("/v1/me");
        const stdKey = me?.profile?.standard;
        if (!stdKey) { setSubjects([]); return; }

        const data = await apiFetch(`/v1/curriculum/subjects?standardId=${encodeURIComponent(stdKey)}`);
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
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading courses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/10 px-4 h-14 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight flex-1">My Courses</h1>
        <span className="text-xs text-slate-400 font-mono">{subjects.length} subjects</span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {subjects.length === 0 && !error && (
          <div className="text-center py-20 space-y-3">
            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl">school</span>
            <p className="text-slate-500">No subjects found for your standard yet.</p>
            <button onClick={() => router.push("/dashboard")} className="text-primary font-bold text-sm hover:underline">
              ← Back to Dashboard
            </button>
          </div>
        )}

        {subjects.map((sub, i) => {
          const c = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
          const subjectId = sub._id || sub.id;
          return (
            <button
              key={subjectId || i}
              type="button"
              onClick={() => subjectId && router.push(`/structure?subjectId=${encodeURIComponent(subjectId)}`)}
              disabled={!subjectId}
              className="w-full text-left glass-card dark:bg-card-dark p-5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center ring-2 ${c.ring} shrink-0`}>
                  <span className={`material-symbols-outlined ${c.text}`}>{c.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                    {sub.name || sub.title || "Subject"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {sub.description || "Continue your learning journey in this subject."}
                  </p>
                  {sub.lessonCount > 0 && (
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {sub.lessonCount} Lessons
                    </span>
                  )}
                </div>
                <span className={`material-symbols-outlined ${c.text} shrink-0`}>arrow_forward_ios</span>
              </div>
            </button>
          );
        })}
      </main>
    </div>
  );
}
