"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiFetch } from "../../../lib/api";
import { listLessons, createQuizVersion } from "../../../lib/admin-api";
import LessonTabs from "../../../components/LessonTabs";
import { motion, AnimatePresence } from "framer-motion";


// ── Admin Quiz Creator Modal ───────────────────────────────────────────────

function QuizCreatorModal({ show, onClose, lessonId, onSuccess }) {
  const [questions, setQuestions] = useState([{ prompt: "", options: ["", "", "", ""], answerIndex: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addQuestion = () => setQuestions([...questions, { prompt: "", options: ["", "", "", ""], answerIndex: 0 }]);
  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

  const updateQuestion = (idx, field, val) => {
    const next = [...questions];
    next[idx][field] = val;
    setQuestions(next);
  };

  const updateOption = (qIdx, optIdx, val) => {
    const next = [...questions];
    next[qIdx].options[optIdx] = val;
    setQuestions(next);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await createQuizVersion({
        lessonId,
        questions: questions.map((q, i) => ({ ...q, qid: `q${i + 1}` })),
        published: true
      });
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#141414] border border-orange-500/20 rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Create Lesson Quiz</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><span className="material-symbols-outlined">close</span></button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">{error}</div>}

        <div className="space-y-12">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="space-y-6 p-6 bg-white/5 rounded-2xl border border-white/5 relative">
              <button onClick={() => removeQuestion(qIdx)} className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-primary tracking-widest">Question {qIdx + 1}</label>
                <input 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                  placeholder="Enter the question prompt..."
                  value={q.prompt}
                  onChange={e => updateQuestion(qIdx, "prompt", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                    <input 
                      type="radio" 
                      name={`correct-${qIdx}`} 
                      checked={q.answerIndex === oIdx}
                      onChange={() => updateQuestion(qIdx, "answerIndex", oIdx)}
                      className="accent-primary"
                    />
                    <input 
                      className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none"
                      placeholder={`Option ${oIdx + 1}`}
                      value={opt}
                      onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <button onClick={addQuestion} className="w-full border-2 border-dashed border-white/10 hover:border-primary/40 p-4 rounded-2xl text-xs font-bold text-white/40 hover:text-primary transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span> ADD QUESTION
          </button>
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "SAVING..." : "PUBLISH QUIZ VERSION"}
          </button>
        </div>
      </div>
    </div>
  );
}


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
  // Robust YouTube ID extraction
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  const id = match ? match[1] : null;

  if (id) return `https://www.youtube.com/embed/${id}`;
  
  // Fallback for Google Drive
  if (url.includes("drive.google.com")) {
      return url.replace("/view", "/preview").replace("/edit", "/preview");
  }
  return url;
}


function isDirectVideo(url = "") {
  const directExtensions = [".mp4", ".webm", ".ogg", ".mov"];
  const cleanUrl = url.split("?")[0].toLowerCase();
  return directExtensions.some(ext => cleanUrl.endsWith(ext));
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
        <p className="text-white/60 mb-6">You&apos;ve successfully completed this lesson.</p>
        
        <div className="bg-primary/10 border border-primary/20 rounded-2xl py-4 mb-8">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
            {xp > 0 ? "XP Earned" : "Mission Mastery"}
          </p>
          <p className="text-4xl font-black text-white">
            {xp > 0 ? `+${xp} XP` : "Mastered"}
          </p>
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

const SAMPLE_QUIZ = {
  title: "Demo Quiz",
  questions: [
    {
      qid: "q1",
      prompt: "What is the primary goal of this lesson?",
      options: ["Mastering the core concepts", "Just passing time", "Watching videos only", "None of the above"],
      answerIndex: 0
    },
    {
      qid: "q2",
      prompt: "How can you earn more XP in this app?",
      options: ["Completing quizzes", "Staying inactive", "Ignoring lessons", "Deleting the app"],
      answerIndex: 0
    },
    {
      qid: "q3",
      prompt: "Is the real backend API for student quizzes coming soon?",
      options: ["No", "Yes, it's being developed!", "Maybe", "I don't know"],
      answerIndex: 1
    }
  ],
  difficulty: "hard"
};

function QuizSection({ lessonId, lessonXP, onComplete, isAdmin }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("idle");

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      // Admins get the full quiz with answers for validation; students get redacted data
      const endpoint = isAdmin 
        ? `/v1/admin/quizzes/latest?lessonId=${lessonId}` 
        : `/v1/attempts/quiz/${lessonId}`;
        
      const res = await apiFetch(endpoint);
      const quizData = res?.data ?? res;
      if (quizData?.questions?.length) {
        setQuiz(quizData);
        setIsFallback(false);
      } else {
        setQuiz(null);
      }
    } catch (err) {
      console.warn("Quiz fetch error:", err);
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);


  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch("/v1/attempts/submit", {
        method: "POST",
        body: JSON.stringify({
          lessonId,
          answers,
          idempotencyKey: `quiz_${lessonId}_${Date.now()}`
        })
      });
      const realXP = res?.xpAwarded ?? res?.data?.xpAwarded ?? lessonXP;
      onComplete(realXP);
    } catch (err) {
      console.error("Failed to submit attempt", err);
      if (isAdmin) {
        onComplete(lessonXP);
      } else {
        alert(err.message || "Failed to submit quiz. You may have already completed this lesson.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white/40">Preparing your challenge...</div>;
  if (!quiz || !quiz.questions?.length) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-6">
        <div className="opacity-30">
          <span className="material-symbols-outlined text-6xl">quiz_off</span>
          <p className="mt-4 italic text-sm">No quiz available for this lesson yet.</p>
        </div>
        
        {isAdmin && (
           <div className="mt-8 p-8 border border-white/5 bg-white/5 rounded-[3rem] w-full max-w-sm">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">Instructor Portal</p>
              <h4 className="text-xl font-bold mb-6">Build the first quiz version?</h4>
              <button 
                onClick={() => setShowCreator(true)}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
              >
                CREATE QUIZ NOW
              </button>
           </div>
        )}

        <QuizCreatorModal 
          show={showCreator} 
          lessonId={lessonId} 
          onClose={() => setShowCreator(false)} 
          onSuccess={() => { setShowCreator(false); fetchQuiz(); }}
        />
      </div>
    );
  }


  const current = quiz.questions[currentIdx];
  const isFinal = currentIdx === quiz.questions.length - 1;
  const hasAnswerIndex = current.answerIndex !== undefined;
  const isCorrect = hasAnswerIndex ? selected === current.answerIndex : true; // default to 'true' style progression if unknown

  const handleAction = () => {
    // If backend doesn't give us the answer to verify, just skip the "Check Answer" phase and go straight to next!
    if (status === "idle" && hasAnswerIndex) {
      setStatus("checked");
      if (isCorrect) setScore((s) => s + 1);
    } else {
      // Move to next
      setAnswers((prev) => [...prev, { qid: current.qid, selectedIndex: selected }]);
      if (isFinal) {
        setDone(true);
      } else {
        setCurrentIdx((i) => i + 1);
        setSelected(null);
        setStatus("idle");
      }
    }
  };

  if (done) {
    const accuracy = hasAnswerIndex ? Math.round((score / quiz.questions.length) * 100) : null;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 text-center flex flex-col items-center"
      >
        {accuracy !== null && (
          <div className="w-32 h-32 mb-6 rounded-full border-4 border-primary/20 flex flex-col items-center justify-center bg-primary/10 shadow-[0_0_40px_rgba(255,107,0,0.2)]">
            <span className="text-4xl font-black text-primary">{accuracy}%</span>
            <span className="text-xs font-bold text-primary/60 uppercase">Accuracy</span>
          </div>
        )}
        <h3 className="text-2xl font-black text-white mb-2">Quiz Complete!</h3>
        <p className="text-white/60 mb-8 font-medium">Your answers have been recorded.</p>
        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full max-w-xs bg-primary hover:bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all outline-none"
        >
          {submitting ? "Claiming XP..." : "Finish & Claim Rewards"}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="p-6 md:p-10 relative overflow-hidden">
      {isFallback && (
        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">info</span>
          Demo Mode: Real Quiz API coming soon for students!
        </div>
      )}
      
      {/* Progress Bar */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
          <span className="text-white/40">Progress</span>
          <span className="text-primary">{currentIdx + 1} / {quiz.questions.length}</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx) / quiz.questions.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="space-y-8"
        >
          <h3 className="text-xl md:text-2xl font-extrabold leading-snug">{current.prompt}</h3>
          
          <div className="space-y-3">
            {current.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrectAnswer = hasAnswerIndex ? idx === current.answerIndex : false;
              
              let stateClasses = "bg-white/5 border-white/10 text-white/80 hover:bg-white/10";
              let icon = null;

              if (status === "idle") {
                if (isSelected) {
                  stateClasses = "bg-primary/10 border-primary text-white shadow-[0_0_15px_rgba(255,107,0,0.15)]";
                }
              } else if (hasAnswerIndex) {
                if (isSelected && isCorrect) {
                  stateClasses = "bg-green-500/20 border-green-500 text-white scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                  icon = <span className="material-symbols-outlined text-green-500 font-bold">check_circle</span>;
                } else if (isSelected && !isCorrect) {
                  stateClasses = "bg-red-500/10 border-red-500/50 text-white/60";
                  icon = <span className="material-symbols-outlined text-red-500 font-bold">cancel</span>;
                } else if (isCorrectAnswer) {
                  stateClasses = "bg-green-500/10 border-green-500/50 text-white";
                  icon = <span className="material-symbols-outlined text-green-500 font-bold">check_circle</span>;
                } else {
                  stateClasses = "bg-white/5 border-white/5 text-white/30 opacity-50";
                }
              }

              return (
                <motion.button
                  key={idx}
                  whileTap={status === "idle" ? { scale: 0.98 } : {}}
                  onClick={() => status === "idle" && setSelected(idx)}
                  disabled={status === "checked"}
                  className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-4 font-medium md:text-lg ${stateClasses}`}
                >
                  <span>{opt}</span>
                  {icon}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 h-16 relative">
        <AnimatePresence mode="popLayout">
          {selected !== null && (
            <motion.button
              key={status}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              onClick={handleAction}
              className={`absolute inset-0 w-full h-full font-bold text-lg rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
                status === "idle" 
                  ? "bg-white text-black hover:bg-slate-200" 
                  : isCorrect 
                    ? "bg-green-500 text-white hover:bg-green-600 shadow-green-500/20"
                    : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
              }`}
            >
              {status === "idle" 
                ? (hasAnswerIndex ? "Check Answer" : "Confirm Answer") 
                : isFinal 
                  ? "Complete Lesson" 
                  : "Next Question"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

function LessonPageContent() {
  const router = useRouter();
  const { lessonId } = useParams();
  const searchParams = useSearchParams();
  const chapterId = searchParams.get("chapterId");
  const { loading: authLoading } = useRequireAuth();

  const [me, setMe] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [awardedXP, setAwardedXP] = useState(0);
  const [view, setView] = useState("content"); // 'content' or 'quiz'

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const [meRes, lessonRes] = await Promise.allSettled([
          apiFetch("/v1/me"),
          apiFetch(`/v1/lessons/${lessonId}`), // ✅ Using new direct GET /v1/lessons/:id endpoint
        ]);
        
        if (meRes.status === "fulfilled") setMe(meRes.value?.data || meRes.value);
        if (lessonRes.status === "fulfilled") {
          const data = lessonRes.value?.data ?? lessonRes.value;
          setLesson(data || null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, lessonId]);

  const lessonXP = lesson?.xp || 100;

  const handleNextAction = () => {
    // Redirect to onboarding if profile is incomplete
    if (me && !me.onboardingComplete) {
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
                <iframe 
                    src={toEmbedUrl(lesson.videoUrl)} 
                    className="w-full h-full border-none" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen 
                />
              ) : isDirectVideo(lesson.videoUrl) ? (
                <video src={lesson.videoUrl} controls className="w-full h-full" />
              ) : (
                <iframe 
                    src={lesson.videoUrl} 
                    className="w-full h-full border-none bg-white" 
                    title="External Lesson Content"
                    allowFullScreen 
                />
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
              <QuizSection lessonId={lessonId} lessonXP={lessonXP} onComplete={(xp) => { setAwardedXP(xp); setShowCompletion(true); }} isAdmin={me?.role === "admin" || me?.adminType === "super"} />
            </div>
          )}
        </div>
      </main>

      <CompletionModal 
        show={showCompletion} 
        xp={awardedXP} 
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
