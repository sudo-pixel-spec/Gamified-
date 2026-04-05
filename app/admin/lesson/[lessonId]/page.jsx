"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../../hooks/useRequireAuth";
import { apiFetch } from "../../../../lib/api";
import LessonVideoPanel from "../../../../components/LessonVideoPanel";
import { updateLesson, listChapters, listLessons } from "../../../../lib/admin-api";

function extract(res) {
  if (!res) return [];
  const d = res?.data?.items ?? res?.data ?? res?.items ?? res;
  return Array.isArray(d) ? d : [];
}

/* ─────────────────────────────────────────────────────────────────
   LESSON QUIZ PANEL
──────────────────────────────────────────────────────────────────*/

function LessonQuizPanel({ lessonId }) {
  const [quiz, setQuiz]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("Lesson Quiz");
  const [xp, setXp]       = useState("100");
  const [questionsText, setQuestionsText] = useState("");  // Empty until real quiz data loads
  const [rawDebug, setRawDebug] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Use the same endpoint & parsing that works in quiz/page.jsx
        const res  = await apiFetch(`/v1/admin/quizzes/latest?lessonId=${lessonId}`);
        const docs = res?.data ?? res;
        const arr  = Array.isArray(docs) ? docs : (docs ? [docs] : []);

        if (!cancelled) setRawDebug({ endpoint: `/v1/admin/quizzes/latest?lessonId=${lessonId}`, arr });

        const pub  = arr.find((d) => d?.isPublished === true);
        const published = pub ?? arr[0] ?? null;

        if (published && !cancelled) {
          setQuiz(published);
          setTitle(published.title || "Lesson Quiz");
          setXp(String(published.xpAwarded ?? published.xp ?? 100));

          if (published.questions?.length) {
            const formatted = published.questions.map(q => {
              const correct = q.answerIndex ?? q.correctIndex ?? 0;
              const opts = q.options.map((o, i) => {
                const text = o?.text ?? String(o);
                return `${String.fromCharCode(65 + i)}. ${i === correct ? "*" : ""}${text}`;
              }).join("\n");
              return `Q: ${q.question ?? q.prompt ?? "Question"}\n${opts}`;
            }).join("\n---\n");
            setQuestionsText(formatted);
          }
        }
      } catch (e) {
        console.warn("Quiz load error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lessonId]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const blocks = questionsText.split("\n---\n").filter(b => b.trim());
      const parsedQuestions = blocks.map((block, i) => {
        const lines = block.trim().split("\n").filter(l => l.trim());
        const prompt = (lines[0] || "").replace(/^Q:\s*/i, "").trim();
        let correctIndex = 0;
        const options = lines.slice(1, 5).map((l, idx) => {
          let text = l.replace(/^[A-D]\.\s*/i, "").trim();
          if (text.startsWith("*")) {
            correctIndex = idx;
            text = text.substring(1).trim();
          }
          return text;
        });
        return {
          qid: `q${i}`,
          prompt: prompt,
          options,
          answerIndex: correctIndex, 
        };
      });

      if (parsedQuestions.length < 2) {
        throw new Error("A quiz requires at least 2 questions.");
      }

      await apiFetch("/v1/admin/quizzes/version", {
        method: "POST",
        body: JSON.stringify({
          lessonId,
          version: (quiz?.version || 0) + 1,
          published: true, 
          questions: parsedQuestions,
          difficulty: "medium",
          source: "seed"
        })
      });

      setSuccess("Quiz saved and published successfully!");
    } catch (err) {
      setError(err?.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">quiz</span>
          <h2 className="text-lg font-bold">Interactive Quiz Configuration</h2>
        </div>
        {!loading && quiz && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
            {quiz.questions?.length ?? 0} questions loaded
          </span>
        )}
        {!loading && !quiz && (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
            No quiz yet
          </span>
        )}
      </div>
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading quiz data...
          </div>
        ) : (
          <>
            {showDebug && rawDebug && (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900 p-3 mb-2 overflow-auto max-h-48">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">🔍 Raw API Response — /v1/admin/quizzes?lessonId</p>
                <pre className="text-[10px] text-emerald-400 whitespace-pre-wrap break-all">{JSON.stringify(rawDebug, null, 2)}</pre>
              </div>
            )}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Quiz Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-sm focus:outline-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">XP Reward</label>
                <input type="number" value={xp} onChange={(e) => setXp(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-sm focus:outline-primary transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Quiz Questions (MCQ Format)</label>
              {!quiz && !questionsText && (
                <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-200 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  No quiz published yet. Write questions below to create the first version.
                </div>
              )}
              <textarea
                value={questionsText}
                onChange={(e) => setQuestionsText(e.target.value)}
                placeholder={`Q: What is the topic?\nA. *Correct answer\nB. Wrong answer\nC. Wrong answer\nD. Wrong answer\n---\nQ: Another question here?\nA. Wrong answer\nB. *Correct answer\nC. Wrong answer\nD. Wrong answer`}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-background-dark/50 text-sm min-h-[300px] font-mono focus:outline-primary resize-y focus:bg-white transition-all shadow-inner"
              />
              <p className="text-xs text-slate-500 mt-2">Separate questions with <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">---</code>. Prefix the correct option with an asterisk <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-primary">*</code>.</p>
            </div>
            {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">{error}</div>}
            {success && <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 font-medium text-sm">{success}</div>}
            <div className="pt-2">
              <button onClick={handleSave} disabled={saving} className="py-3 px-6 w-full md:w-auto bg-primary text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                {saving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"/> : <span className="material-symbols-outlined text-[18px]">publish</span>}
                {saving ? "Publishing Quiz..." : "Save & Publish Quiz"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────────*/

export default function AdminLessonEditorPage({ params }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.lessonId;
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();

  const [lesson, setLesson] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Basic Details Form State
  const [formData, setFormData] = useState({ title: "", chapterId: "", contentText: "", orderIndex: "" });
  const [savingBasic, setSavingBasic] = useState(false);
  const [basicSuccess, setBasicSuccess] = useState("");
  const [basicError, setBasicError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      try {
        const [lessonsRes, chaptersRes] = await Promise.all([
          listLessons(),
          listChapters()
        ]);
        
        if (!cancelled) {
          const allLessons = extract(lessonsRes);
          const found = allLessons.find(l => (l._id || l.id) === lessonId);
          if (found) {
            setLesson(found);
            setFormData({
              title: found.title || found.name || "",
              chapterId: found.chapterId?._id || found.chapterId?.id || found.chapterId || "",
              contentText: found.contentText || found.content || "",
              orderIndex: found.orderIndex ?? ""
            });
          }
          setChapters(extract(chaptersRes));
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load lesson:", err);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authLoading, lessonId]);

  const handleSaveBasic = async () => {
    setSavingBasic(true);
    setBasicSuccess("");
    setBasicError("");
    try {
      const payload = {
        title: formData.title,
        chapterId: formData.chapterId,
        contentText: formData.contentText,
      };
      if (formData.orderIndex !== "") payload.orderIndex = Number(formData.orderIndex);
      
      await updateLesson(lessonId, payload);
      setBasicSuccess("Basic details saved successfully!");
      setTimeout(() => setBasicSuccess(""), 3000);
    } catch (err) {
      setBasicError(err?.message || "Failed to save details");
    } finally {
      setSavingBasic(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">
        <span className="material-symbols-outlined text-4xl mb-4">error</span>
        <h1 className="text-xl font-bold">Lesson not found</h1>
        <button onClick={() => router.push("/admin")} className="mt-4 text-primary font-bold">Return to Admin</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-24">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin")} className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary transition-colors hover:text-primary shadow-sm hover:shadow-md active:scale-95 group">
            <span className="material-symbols-outlined transition-transform group-hover:-translate-x-0.5">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Lesson Editor</h1>
            <p className="text-xs text-slate-500 line-clamp-1">{lesson.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => router.push("/admin/explorer")}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-primary transition-all text-slate-400 hover:text-primary shadow-sm"
                title="Curriculum Explorer"
            >
                <span className="material-symbols-outlined">account_tree</span>
            </button>
        </div>
      </header>


      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ── BASIC DETAILS ── */}
        <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">feed</span>
              <h2 className="text-lg font-bold">Content & Properties</h2>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Lesson Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-sm focus:outline-primary transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Chapter</label>
                    <select 
                      value={formData.chapterId} 
                      onChange={(e) => setFormData({...formData, chapterId: e.target.value})} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-sm focus:outline-primary transition-all"
                    >
                      <option value="" disabled>Select Chapter</option>
                      {chapters.map(c => <option key={c._id||c.id} value={c._id||c.id}>{c.name||c.title}</option>)}
                    </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Order</label>
                  <input 
                    type="number" 
                    value={formData.orderIndex} 
                    onChange={(e) => setFormData({...formData, orderIndex: e.target.value})} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-sm focus:outline-primary transition-all" 
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Main Content (Markdown)</label>
              <textarea 
                value={formData.contentText} 
                onChange={(e) => setFormData({...formData, contentText: e.target.value})} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-background-dark/50 text-sm min-h-[250px] font-mono focus:outline-primary resize-y transition-all shadow-inner" 
                placeholder="## Heading...&#10;> Blockquote..."
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {basicSuccess && <span className="text-emerald-500 text-sm font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> {basicSuccess}</span>}
                {basicError && <span className="text-red-500 text-sm font-medium bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">{basicError}</span>}
              </div>
              <button onClick={handleSaveBasic} disabled={savingBasic} className="px-6 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-500/20">
                {savingBasic ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/> : <span className="material-symbols-outlined text-[18px]">save</span>}
                Save Content
              </button>
            </div>
          </div>
        </section>

        {/* ── VIDEO CONFIG ── */}
        <section className="mt-8">
           {/* LessonVideoPanel handles its own styling, but we can wrap it slightly to conform natively */}
           <div className="rounded-2xl overflow-hidden shadow-sm">
             <LessonVideoPanel
               lessonId={lessonId}
               lessonTitle={lesson.title}
               lessonContent={lesson.contentText ?? lesson.content ?? ""}
               currentVideoUrl={lesson.videoUrl ?? ""}
               onSaved={(url) => setLesson({...lesson, videoUrl: url})}
             />
           </div>
        </section>

        {/* ── QUIZ CONFIG ── */}
        <section className="mt-8">
           <LessonQuizPanel lessonId={lessonId} />
        </section>

      </main>
    </div>
  );
}
