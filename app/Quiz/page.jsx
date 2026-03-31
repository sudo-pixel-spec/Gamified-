"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiFetch } from "../../lib/api";

// ── helpers ────────────────────────────────────────────────────────────────

function qv(sp, key, fb = "") { return sp.get(key) || fb; }

function generateIdempotencyKey(lessonId) {
  return `${lessonId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── ResultScreen ───────────────────────────────────────────────────────────

function ResultScreen({ result, total, onRetry, onBack, onNext }) {
  const pct = Math.round((result.score / total) * 100);
  const passed = pct >= 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="w-full max-w-md bg-card-light dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 text-center space-y-6">

        {/* icon */}
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-4xl shadow-lg ${passed ? "bg-green-500" : "bg-primary"}`}>
          <span className="material-icons-round text-4xl">
            {passed ? "emoji_events" : "replay"}
          </span>
        </div>

        <div>
          <h2 className="text-3xl font-display font-bold">{pct}%</h2>
          <p className="text-slate-500 text-sm mt-1">{result.score} of {total} correct</p>
        </div>

        {/* rewards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
            <span className="material-icons-round text-blue-500 text-xl">stars</span>
            <p className="text-xs text-slate-500 mt-1">XP</p>
            <p className="font-bold text-blue-600 dark:text-blue-400">+{result.xpAwarded ?? 0}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-100 dark:border-yellow-800">
            <span className="material-icons-round text-yellow-500 text-xl">toll</span>
            <p className="text-xs text-slate-500 mt-1">Coins</p>
            <p className="font-bold text-yellow-600 dark:text-yellow-400">+{result.coinsAwarded ?? 0}</p>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-3 border border-cyan-100 dark:border-cyan-800">
            <span className="material-icons-round text-cyan-500 text-xl">diamond</span>
            <p className="text-xs text-slate-500 mt-1">Diamonds</p>
            <p className="font-bold text-cyan-600 dark:text-cyan-400">+{result.diamondsAwarded ?? 0}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-sm">replay</span>
            Retry
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-sm">arrow_forward</span>
            Next Lesson
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main quiz content ──────────────────────────────────────────────────────

function QuizPageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { loading: authLoading } = useRequireAuth();

  const lessonId  = qv(searchParams, "lessonId", "");
  const subjectId = qv(searchParams, "subjectId", "");
  const chapterId = qv(searchParams, "chapterId", "");

  // ── state ─────────────────────────────────────────────────────────────────
  const [quizDoc,      setQuizDoc]      = useState(null);
  const [loadError,    setLoadError]    = useState("");
  const [loading,      setLoading]      = useState(true);

  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [answers,      setAnswers]       = useState({});       // { qid: selectedIndex }
  const [selected,     setSelected]      = useState(null);     // index chosen this question
  const [revealed,     setRevealed]      = useState(false);    // show correct/wrong

  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState("");
  const [result,       setResult]       = useState(null);      // response from submitAttempt

  const startTimeRef   = useRef(Date.now());
  const idempotencyKey = useRef(generateIdempotencyKey(lessonId));

  // ── load quiz ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (authLoading || !lessonId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res  = await apiFetch(`/v1/admin/quizzes/latest?lessonId=${lessonId}`);
        const docs = res?.data ?? res;
        const arr  = Array.isArray(docs) ? docs : (docs ? [docs] : []);
        const pub  = arr.find((d) => d?.isPublished === true);
        const best = pub ?? arr[0] ?? null;

        if (!cancelled) {
          if (best?.questions?.length) {
            setQuizDoc(best);
          } else {
            setLoadError("No quiz available for this lesson yet.");
          }
        }
      } catch {
        if (!cancelled) setLoadError("Could not load quiz. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, lessonId]);

  // ── derived ───────────────────────────────────────────────────────────────

  const questions    = quizDoc?.questions ?? [];
  const total        = questions.length;
  const currentQ     = questions[currentIdx] ?? null;
  const isLast       = currentIdx === total - 1;
  const allAnswered  = total > 0 && Object.keys(answers).length === total;

  // ── handlers ──────────────────────────────────────────────────────────────

  function handleSelect(optionIndex) {
    if (revealed) return;           // locked after reveal
    setSelected(optionIndex);
  }

  function handleReveal() {
    if (selected === null) return;
    setRevealed(true);
    // persist the answer
    setAnswers((prev) => ({ ...prev, [currentQ.qid]: selected }));
  }

  function handleNext() {
    setSelected(null);
    setRevealed(false);
    setCurrentIdx((i) => i + 1);
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError("");

    const timeSpentSec = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Build answers array in the exact shape the controller expects
    const answersPayload = Object.entries(answers).map(([qid, selectedIndex]) => ({
      qid,
      selectedIndex,
    }));

    try {
      const res = await apiFetch("/v1/attempts/submit", {
        method: "POST",
        body: JSON.stringify({
          lessonId,
          answers: answersPayload,
          timeSpentSec,
          idempotencyKey: idempotencyKey.current,
        }),
      });

      const data = res?.data ?? res;
      // Redirect back to lesson page with completion params so it shows the overlay
      const params = new URLSearchParams({
        lessonId,
        completed: "1",
        xpAwarded: String(data?.xpAwarded ?? 0),
        ...(subjectId && { subjectId }),
        ...(chapterId && { chapterId }),
      });
      router.replace(`/lesson?${params.toString()}`);
    } catch (err) {
      const msg = err?.message ?? "Submission failed. Please try again.";
      setSubmitError(msg);
      setSubmitting(false);
    }
  }

  function handleRetry() {
    // Fresh idempotency key so backend allows a new attempt
    idempotencyKey.current = generateIdempotencyKey(lessonId);
    startTimeRef.current   = Date.now();
    setAnswers({});
    setCurrentIdx(0);
    setSelected(null);
    setRevealed(false);
    setResult(null);
    setSubmitError("");
  }

  // ── loading / error states ────────────────────────────────────────────────

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
        <div className="text-center space-y-4">
          <span className="material-icons-round text-slate-300 text-6xl">quiz</span>
          <p className="text-slate-500">{loadError}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-primary font-bold text-sm flex items-center gap-1 mx-auto"
          >
            <span className="material-icons-round text-sm">arrow_back</span>
            Back to lesson
          </button>
        </div>
      </div>
    );
  }

  // ── result screen ─────────────────────────────────────────────────────────

  if (result) {
    return (
      <ResultScreen
        result={result}
        total={total}
        onRetry={handleRetry}
        onNext={() => {
          const params = new URLSearchParams({
            lessonId,
            completed: "1",
            xpAwarded: String(result?.xpAwarded ?? 0),
            ...(subjectId && { subjectId }),
            ...(chapterId && { chapterId }),
          });
          router.replace(`/lesson?${params.toString()}`);
        }}
        onBack={() => router.back()}
      />
    );
  }

  // ── quiz UI ───────────────────────────────────────────────────────────────

  const correctIndex = currentQ?.answerIndex ?? currentQ?.correctIndex ?? -1;
  const progress     = ((currentIdx) / total) * 100;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">

      {/* top bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>

          {/* progress bar */}
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-sm font-bold text-slate-500 shrink-0">
            {currentIdx + 1} / {total}
          </span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* quiz title */}
        {quizDoc?.title && (
          <p className="text-xs font-bold text-primary uppercase tracking-widest">
            {quizDoc.title}
          </p>
        )}

        {/* question card */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">

          <h2 className="text-xl font-display font-bold leading-snug">
            {currentQ?.question ?? currentQ?.text ?? currentQ?.prompt ?? ""}
          </h2>

          {/* options */}
          <div className="space-y-3">
            {(currentQ?.options ?? []).map((opt, i) => {
              const optText = typeof opt === "string" ? opt : opt?.text ?? opt?.label ?? String(opt);
              const isSelected = selected === i;
              const isCorrect  = i === correctIndex;

              let style = "border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5";

              if (revealed) {
                if (isCorrect)         style = "border-green-500 bg-green-50 dark:bg-green-900/20";
                else if (isSelected)   style = "border-red-400 bg-red-50 dark:bg-red-900/20";
                else                   style = "border-slate-200 dark:border-slate-700 opacity-50";
              } else if (isSelected) {
                style = "border-primary bg-primary/10";
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(i)}
                  disabled={revealed}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm flex items-center gap-3 ${style}`}
                >
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold
                    ${revealed && isCorrect ? "border-green-500 bg-green-500 text-white"
                    : revealed && isSelected && !isCorrect ? "border-red-400 bg-red-400 text-white"
                    : isSelected ? "border-primary bg-primary text-white"
                    : "border-slate-300 dark:border-slate-600 text-slate-400"}`}
                  >
                    {revealed && isCorrect
                      ? <span className="material-icons-round text-xs">check</span>
                      : revealed && isSelected && !isCorrect
                      ? <span className="material-icons-round text-xs">close</span>
                      : String.fromCharCode(65 + i)}
                  </span>
                  {optText}
                </button>
              );
            })}
          </div>

          {/* explanation after reveal */}
          {revealed && currentQ?.explanation && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-200">
              <span className="font-bold">Explanation: </span>
              {currentQ.explanation}
            </div>
          )}
        </div>

        {/* submit error */}
        {submitError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {submitError}
          </div>
        )}

        {/* action button */}
        <div className="pb-8">
          {!revealed ? (
            // CONFIRM answer
            <button
              type="button"
              onClick={handleReveal}
              disabled={selected === null}
              className="w-full bg-primary hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-display font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              CHECK ANSWER
            </button>
          ) : isLast ? (
            // SUBMIT all answers
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-display font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                : <><span className="material-icons-round">send</span> SUBMIT QUIZ</>
              }
            </button>
          ) : (
            // NEXT question
            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-primary hover:bg-orange-600 text-white font-display font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              NEXT QUESTION
              <span className="material-icons-round">arrow_forward</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

// ── export ─────────────────────────────────────────────────────────────────

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}