"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiFetch } from "../../../lib/api";
import { listLessons } from "../../../lib/admin-api";
import LessonTabs from "../../../components/LessonTabs";
import { motion, AnimatePresence } from "framer-motion";

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

function isYouTube(url = "") {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function toEmbedUrl(url = "") {
  return url
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "youtube.com/embed/");
}

// ── Completion Modal ───────────────────────────────────────────────────────

function CompletionModal({ show, xp, onNext }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-[#141414] border-2 border-primary/30 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(255,107,0,0.2)]"
      >
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-3xl font-extrabold text-white mb-2">Amazing Job!</h2>
        <p className="text-white/60 mb-6">You've successfully completed this lesson.</p>
        
        <div className="bg-primary/10 border border-primary/20 rounded-2xl py-4 mb-8">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">XP Earned</p>
          <p className="text-4xl font-black text-white">+{xp} XP</p>
        </div>

        <button 
          onClick={onNext}
          className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          CONTINUE ADVENTURE
          <span className="material-symbols-outlined">rocket_launch</span>
        </button>
      </motion.div>
    </div>
  );
}

// ── Quiz Section ───────────────────────────────────────────────────────────

function QuizSection({ lessonId, lessonXP, onComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Task 1: Temporarily use admin quiz route
        // TODO: Replace with dedicated student route once available
        const res = await apiFetch(`/v1/admin/quizzes/latest?lessonId=${lessonId}`);
        if (res?.data) {
          setQuiz(res.data);
        }
      } catch (err) {
        console.error("Failed to load quiz", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // POST /v1/attempts/submit
      await apiFetch("/v1/attempts/submit", {
        method: "POST",
        body: JSON.stringify({
          lessonId,
          score,
          answers,
          totalQuestions: quiz?.questions?.length || 0,
          xpEarned: lessonXP,
          idempotencyKey: `quiz_${lessonId}_${Date.now()}`
        })
      });
      onComplete(lessonXP);
    } catch (err) {
      console.error("Failed to submit attempt", err);
      // Fallback locally for demo
      onComplete(lessonXP);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white/40">Preparing your challenge...</div>;
  if (!quiz || !quiz.questions?.length) return <div className="p-8 text-center text-white/40 italic">No quiz available for this lesson yet.</div>;

  const current = quiz.questions[currentIdx];
  const isFinal = currentIdx === quiz.questions.length - 1;

  const handleNext = () => {
    if (selected === current.answerIndex) setScore(s => s + 1);
    setAnswers(prev => [...prev, selected]);
    
    if (isFinal) {
      setDone(true);
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    }
  };

  if (done) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-bold mb-4">Quiz Finished!</h3>
        <p className="text-white/60 mb-6">You got {score} out of {quiz.questions.length} right.</p>
        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          {submitting ? "Claiming XP..." : "Finish Lesson"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <span className="text-xs font-bold text-primary uppercase">Question {currentIdx + 1} of {quiz.questions.length}</span>
        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }} />
        </div>
      </div>
      <h3 className="text-lg font-bold mb-6">{current.prompt}</h3>
      <div className="space-y-3">
        {current.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(idx)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selected === idx 
                ? "bg-primary/20 border-primary text-white" 
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={handleNext}
        disabled={selected === null}
        className="w-full mt-8 bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-30"
      >
        {isFinal ? "Show Results" : "Next Question"}
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

function LessonPageContent() {
  const router = useRouter();
  const { lessonId } = useParams();
  const { loading: authLoading } = useRequireAuth();

  const [me, setMe] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [view, setView] = useState("content"); // 'content' or 'quiz'

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const [meRes, lessonsRes] = await Promise.allSettled([
          apiFetch("/v1/me"),
          listLessons(), // Using existing listLessons helper
        ]);
        
        if (meRes.status === "fulfilled") setMe(meRes.value?.data || meRes.value);
        if (lessonsRes.status === "fulfilled") {
          const lessons = asArray(lessonsRes.value);
          const found = lessons.find(l => (l._id || l.id) === lessonId);
          setLesson(found || null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, lessonId]);

  const lessonXP = lesson?.xp || 100;

  const handleNextAction = () => {
    // Task 4: Redirect to onboarding if profile is incomplete
    if (!me?.profile?.completedOnboarding) {
      router.push("/completeprofile");
    } else {
      router.push("/structure");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-orange-500/10 h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white">
             <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{lesson?.unit?.name || "CURRICULUM"}</p>
            <h1 className="text-sm font-bold truncate max-w-[200px]">{lesson?.title || "Lesson"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1.5">
             <span className="material-symbols-outlined text-primary text-sm">stars</span>
             <span className="text-xs font-bold text-white">{lessonXP} XP</span>
           </div>
           <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs uppercase">
             {me?.profile?.fullName?.slice(0,2) || "JD"}
           </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-32">
        {/* Video Player Section */}
        {view === "content" && (
          <div className="rounded-3xl overflow-hidden bg-slate-900 aspect-video border border-white/5 shadow-2xl relative group">
            {lesson?.videoUrl ? (
              isYouTube(lesson.videoUrl) ? (
                <iframe src={toEmbedUrl(lesson.videoUrl)} className="w-full h-full" allowFullScreen />
              ) : (
                <video src={lesson.videoUrl} controls className="w-full h-full" />
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                <span className="material-symbols-outlined text-6xl mb-2">videocam_off</span>
                <p className="text-sm">Video coming soon!</p>
              </div>
            )}
          </div>
        )}

        {/* Content Tabs / Quiz Wrapper */}
        <div className="bg-[#141414] rounded-3xl border border-orange-500/10 shadow-sm overflow-hidden">
          {view === "content" ? (
            <div className="p-1">
              <LessonTabs content={lesson?.contentText || lesson?.description || "# Welcome\nCheck back soon for content!"} />
              <div className="p-8 pt-0 border-t border-white/5 mt-4">
                <div className="flex items-center justify-between p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-lg">Ready to test your knowledge?</h3>
                    <p className="text-white/40 text-sm">Complete the activity to claim your {lessonXP} XP!</p>
                  </div>
                  <button 
                    onClick={() => setView("quiz")}
                    className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    START QUIZ
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-[400px]">
              <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold">Lesson Quiz</h3>
                <button onClick={() => setView("content")} className="text-xs text-white/40 hover:text-white uppercase font-bold underline">Back to lesson</button>
              </div>
              <QuizSection lessonId={lessonId} lessonXP={lessonXP} onComplete={(xp) => setShowCompletion(true)} />
            </div>
          )}
        </div>
      </main>

      <CompletionModal 
        show={showCompletion} 
        xp={lessonXP} 
        onNext={handleNextAction}
      />
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <LessonPageContent />
    </Suspense>
  );
}
