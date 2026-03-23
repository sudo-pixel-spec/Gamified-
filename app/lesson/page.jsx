"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiFetch } from "../../lib/api";
import { listLessons } from "../../lib/admin-api";

// ── helpers ────────────────────────────────────────────────────────────────

function asArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  const candidates = [
    res?.data, res?.items, res?.results, res?.docs, res?.list,
    res?.data?.items, res?.data?.results, res?.data?.docs,
    res?.data?.list, res?.data?.lessons,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
}

function getId(item)        { return item?._id ?? item?.id ?? null; }
function getEntityKey(item) { return String(getId(item) ?? item?.slug ?? item?.code ?? item?.title ?? item?.name ?? ""); }
function qv(sp, key, fb="") { return sp.get(key) || fb; }

function isYouTube(url="") {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function toEmbedUrl(url="") {
  return url
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "youtube.com/embed/");
}

// ── VideoPlayer ────────────────────────────────────────────────────────────

function VideoPlayer({ videoUrl, lessonTitle }) {
  const [playing, setPlaying] = useState(false);

  // No video set yet
  if (!videoUrl) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <span className="material-icons-round text-5xl">videocam_off</span>
          <p className="text-sm font-medium">No video uploaded yet for this lesson</p>
        </div>
      </div>
    );
  }

  // YouTube embed
  if (isYouTube(videoUrl)) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <iframe
          src={toEmbedUrl(videoUrl)}
          title={lessonTitle}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  // D-ID / direct video URL
  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl group">
      {!playing ? (
        <>
          <video
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
            >
              <span className="material-icons-round text-4xl ml-1">play_arrow</span>
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white text-sm font-medium drop-shadow-md truncate">{lessonTitle}</p>
          </div>
        </>
      ) : (
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full"
        />
      )}
    </div>
  );
}

// ── main page content ──────────────────────────────────────────────────────

function LessonPageContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { loading: authLoading } = useRequireAuth();

  const [me,          setMe]          = useState(null);
  const [lesson,      setLesson]      = useState(null);
  const [lessonError, setLessonError] = useState("");
  const [loading,     setLoading]     = useState(true);

  const lessonId = qv(searchParams, "lessonId", "");

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLessonError("");
      try {
        const [meRes, lessonsRes] = await Promise.allSettled([
          apiFetch("/v1/me"),
          listLessons(),
        ]);

        if (!cancelled) {
          setMe(meRes.status === "fulfilled" ? meRes.value?.data ?? meRes.value : null);

          if (lessonsRes.status === "fulfilled") {
            const lessons = asArray(lessonsRes.value);
            const found   = lessons.find((item) => getEntityKey(item) === String(lessonId));
            setLesson(found || null);
            if (!found) setLessonError("Lesson not found.");
          } else {
            setLessonError("Lesson details could not be loaded.");
          }
        }
      } catch {
        if (!cancelled) {
          setMe(null);
          setLesson(null);
          setLessonError("Lesson details could not be loaded.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, lessonId]);

  // ── derived values from lesson ──────────────────────────────────────────

  const lessonTitle  = lesson?.title       || lesson?.name        || qv(searchParams, "title",       "Lesson");
  const moduleLabel  = lesson?.unitName    || lesson?.unit?.name  || qv(searchParams, "module",      "Module");
  const chapterTitle = lesson?.chapterName || lesson?.chapter?.name || qv(searchParams, "chapter",   "Chapter");
  const description  = lesson?.description || lesson?.summary     || qv(searchParams, "description", "");
  const videoUrl     = lesson?.videoUrl    || "";

  // contentText is the rich lesson body; fall back to content or description
  const lessonContent = lesson?.contentText || lesson?.content || "";

  // XP this lesson awards (default 100 if not set)
  const lessonXP = lesson?.xp ?? lesson?.points ?? 100;

  // Tags / topics from lesson (e.g. lesson.tags = ["Data Types", "Variables"])
  const tags = Array.isArray(lesson?.tags) ? lesson.tags : [];

  // ── learner stats ───────────────────────────────────────────────────────

  const learnerInitials = useMemo(() => {
    const fullName = me?.profile?.fullName || "JD";
    return fullName.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  }, [me]);

  const streak = me?.streakCount ?? 0;
  const totalXP = me?.totalXP ?? 0;

  // ── streak calendar (last 7 days) ───────────────────────────────────────

  const streakDays = useMemo(() => {
    const completed = me?.completedDates ?? [];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const iso = d.toISOString().slice(0, 10);
      const isToday = i === 6;
      return { label: ["M","T","W","T","F","S","S"][d.getDay() === 0 ? 6 : d.getDay() - 1], done: completed.includes(iso), isToday };
    });
  }, [me]);

  // ── loading state ───────────────────────────────────────────────────────

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading lesson…</p>
        </div>
      </div>
    );
  }

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-40 z-0 star-field" />

      {/* nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <span className="material-icons-round align-middle">arrow_back</span>
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-primary uppercase tracking-widest truncate">{moduleLabel}</span>
                <h1 className="text-lg font-display font-bold leading-tight truncate">{lessonTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {streak > 0 && (
                <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <span className="material-icons-round text-primary text-sm">local_fire_department</span>
                  <span className="text-sm font-bold">{streak} Day Streak</span>
                </div>
              )}
              {totalXP > 0 && (
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <span className="material-icons-round text-blue-500 text-sm">stars</span>
                  <span className="text-sm font-bold">{totalXP.toLocaleString()} XP</span>
                </div>
              )}
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-700 shadow-lg">
                {learnerInitials || "JD"}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── left column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">

            {/* video */}
            <VideoPlayer videoUrl={videoUrl} lessonTitle={lessonTitle} />

            {/* lesson content */}
            <article className="prose prose-slate dark:prose-invert max-w-none bg-card-light dark:bg-card-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">

              {lessonError && (
                <div className="mb-6 rounded-xl border border-amber-300/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200 not-prose">
                  {lessonError}
                </div>
              )}

              <h2 className="font-display text-2xl font-bold mt-0">{chapterTitle}</h2>

              {description && (
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
              )}

              {/* tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 my-4 not-prose">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* main lesson body */}
              {lessonContent ? (
                <div className="not-prose rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-5 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                  {lessonContent}
                </div>
              ) : (
                !lessonError && (
                  <p className="text-slate-500 italic text-sm">
                    No lesson content available yet. Check back soon!
                  </p>
                )
              )}
            </article>

            {/* mobile CTA */}
            <div className="lg:hidden">
              <button className="w-full bg-primary hover:bg-orange-600 text-white font-display font-bold py-5 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 transition-all active:scale-95">
                START ACTIVITY
                <span className="material-icons-round">rocket_launch</span>
              </button>
            </div>
          </div>

          {/* ── right sidebar ────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">

              {/* XP reward badge */}
              <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-primary">stars</span>
                  <span className="text-sm font-bold text-primary">Earn {lessonXP} XP</span>
                </div>
                <span className="text-xs text-slate-500">Complete this lesson</span>
              </div>

              {/* activities */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activities</h4>

                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-primary">quiz</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate">Concept Check</h4>
                    <p className="text-xs text-slate-500">5 Questions • 50 XP</p>
                  </div>
                  <span className="material-icons-round text-slate-300 ml-auto shrink-0">chevron_right</span>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-blue-500">terminal</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate">Interactive Lab</h4>
                    <p className="text-xs text-slate-500">Practical Session • 150 XP</p>
                  </div>
                  <span className="material-icons-round text-slate-300 ml-auto shrink-0">chevron_right</span>
                </div>
              </div>

              <button className="w-full bg-primary hover:bg-orange-600 text-white font-display font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95">
                START ACTIVITY
                <span className="material-icons-round">rocket_launch</span>
              </button>

              {/* streak calendar */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Streak Calendar</h4>
                <div className="grid grid-cols-7 gap-1">
                  {streakDays.map((d, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center text-[10px] text-slate-400">
                      {d.label}
                    </div>
                  ))}
                  {streakDays.map((d, i) =>
                    d.isToday ? (
                      <div key={i} className="aspect-square rounded-md bg-primary flex items-center justify-center">
                        <span className="material-icons-round text-white text-xs">bolt</span>
                      </div>
                    ) : d.done ? (
                      <div key={i} className="aspect-square rounded-md bg-primary/20 flex items-center justify-center">
                        <span className="material-icons-round text-primary text-xs">done</span>
                      </div>
                    ) : (
                      <div key={i} className="aspect-square rounded-md bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700" />
                    )
                  )}
                </div>
                {streak > 0 && (
                  <p className="text-center text-[11px] mt-3 text-slate-500 font-medium">
                    Complete today to hit {streak + 1} days!
                  </p>
                )}
              </div>
            </div>

            {/* reward nudge — only show if streak is meaningful */}
            {streak >= 10 && (
              <div className="bg-gradient-to-br from-orange-500/10 to-transparent p-4 rounded-2xl border border-primary/20 flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary blur-lg opacity-20 animate-pulse" />
                  <span className="material-icons-round text-primary text-4xl relative">workspace_premium</span>
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-tight text-primary">Consistency Reward</h5>
                  <p className="text-xs text-slate-400">Unlock &quot;Galaxy Voyager&quot; badge at 15 days.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

// ── export ─────────────────────────────────────────────────────────────────

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <LessonPageContent />
    </Suspense>
  );
}