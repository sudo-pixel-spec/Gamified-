"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import {
  createStandard,
  createSubject,
  createUnit,
  createChapter,
  createLesson,
} from "../../../lib/admin-api";
import { apiFetch } from "../../../lib/api";

const SEED_TEMPLATE = {
  "standard": {
    "code": "grade_8",
    "name": "Grade 8",
    "active": true,
    "description": "Comprehensive Data Science Curriculum for 8th Graders",
    "order": 8
  },
  "subject": {
    "name": "Data Science",
    "description": "Master how computers process information in 15 core lessons.",
    "order": 1
  },
  "unit": {
    "name": "The World of Data",
    "description": "From basic definitions to advanced AI and Ethics.",
    "order": 1
  },
  "chapters": [
    {
      "name": "Chapter 1: Foundations of Info",
      "description": "Understanding the basics of text, numbers, and storage.",
      "order": 1,
      "lessons": [
        { "title": "Welcome to Data", "description": "What is digital information?", "videoUrl": "https://youtu.be/i6tet4az1LU", "content": "Data is information! Everything from texts to photos.", "order": 1, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Is a photo data?", "options": ["Yes", "No"], "answerIndex": 0 }] } },
        { "title": "Numbers vs Words", "description": "Quant vs Qual.", "videoUrl": "https://youtu.be/wV3berZhy4w", "content": "Quant = Numbers. Qual = Descriptions.", "order": 2, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Which is Quant?", "options": ["3 Cats", "Soft Fur"], "answerIndex": 0 }] } },
        { "title": "Big Data Intro", "description": "What happens when data is massive?", "videoUrl": "https://youtu.be/BAfHn3v0i_k", "content": "Big Data involves billions of records analyzed by supercomputers.", "order": 3, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Is Big Data small?", "options": ["No", "Yes"], "answerIndex": 0 }] } },
        { "title": "Data Storage", "description": "Where does information live?", "videoUrl": "https://youtu.be/u88v98aGZsc", "content": "Data lives in Servers, Cloud, and Hard Drives.", "order": 4, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Where is cloud data?", "options": ["On servers", "In actual clouds"], "answerIndex": 0 }] } }
      ]
    },
    {
      "name": "Chapter 2: Data Visualization",
      "description": "Turning numbers into beautiful charts.",
      "order": 2,
      "lessons": [
        { "title": "The Power of Charts", "description": "Why visualization matters.", "videoUrl": "https://youtu.be/JyvE-TUClWI", "content": "Visuals help our brains spot patterns faster than tables.", "order": 1, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Do charts help?", "options": ["Yes", "No"], "answerIndex": 0 }] } },
        { "title": "Bar Charts", "description": "Comparing categories.", "videoUrl": "https://youtu.be/JyvE-TUClWI", "content": "Use bars to see who has more.", "order": 2, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Best for comparisons?", "options": ["Bar Chart", "Dot"], "answerIndex": 0 }] } },
        { "title": "Pie Charts", "description": "Slices of the whole.", "videoUrl": "https://youtu.be/JyvE-TUClWI", "content": "Slices represent percentages of a total.", "order": 3, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Is it a circle?", "options": ["Yes", "No"], "answerIndex": 0 }] } },
        { "title": "Line Graphs", "description": "Changes over time.", "videoUrl": "https://youtu.be/JyvE-TUClWI", "content": "Track growth or decline over a period.", "order": 4, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Best for timeline?", "options": ["Line Graph", "Pie Chart"], "answerIndex": 0 }] } }
      ]
    },
    {
      "name": "Chapter 3: AI & Intelligence",
      "description": "How computers learn to think.",
      "order": 3,
      "lessons": [
        { "title": "What is AI?", "description": "The logic behind smart apps.", "videoUrl": "https://youtu.be/gak8JChIEp4", "content": "AI is machines mimicking human intelligence.", "order": 1, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Can AI learn?", "options": ["Yes", "No"], "answerIndex": 0 }] } },
        { "title": "Machine Learning", "description": "Training computers with data.", "videoUrl": "https://youtu.be/f_uvGfH_YhY", "content": "Computers find patterns in data to make predictions.", "order": 2, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Does ML need data?", "options": ["Yes", "No"], "answerIndex": 0 }] } },
        { "title": "Neural Networks", "description": "Brain-like structures in code.", "videoUrl": "https://youtu.be/f_uvGfH_YhY", "content": "Complex layers that process complex data like faces.", "order": 3, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Are they organic?", "options": ["No, they are code", "Yes"], "answerIndex": 0 }] } },
        { "title": "Future of AI", "description": "Where is AI going?", "videoUrl": "https://youtu.be/f_uvGfH_YhY", "content": "From self-driving cars to space exploration.", "order": 4, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "AI to space?", "options": ["Yes", "No"], "answerIndex": 0 }] } }
      ]
    },
    {
      "name": "Chapter 4: Privacy & Ethics",
      "description": "Using data responsibly.",
      "order": 4,
      "lessons": [
        { "title": "Bias & Fairness", "description": "Why data isn't always fair.", "videoUrl": "https://youtu.be/gV0_raJR2ls", "content": "If we train AI on limited data, it might be unfair.", "order": 1, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Can data be unfair?", "options": ["Yes", "No"], "answerIndex": 0 }] } },
        { "title": "Digital Footprint", "description": "Tracking your history.", "videoUrl": "https://youtu.be/yS7YIDT2oGY", "content": "Every click leaves a trail. Be careful!", "order": 2, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Is it permanent?", "options": ["Mostly yes", "No"], "answerIndex": 0 }] } },
        { "title": "Cyber Privacy", "description": "Keeping hackers away.", "videoUrl": "https://youtu.be/yS7YIDT2oGY", "content": "Passwords and privacy settings are your best friends.", "order": 3, "quiz": { "xpAwarded": 100, "questions": [{ "prompt": "Share password?", "options": ["Never", "Always"], "answerIndex": 0 }] } }
      ]
    }
  ]
};



function extractId(res) {
  return res?.data?._id ?? res?.data?.id ?? res?._id ?? res?.id ?? null;
}

async function runSeed(plan, onLog) {
  onLog({ text: `Creating Standard: ${plan.standard.name}…`, status: "running" });
  const stdRes     = await createStandard({ 
    ...plan.standard, 
    orderIndex: plan.standard.order,
    active: true // Ensure it is visible by default
  });
  const standardId = extractId(stdRes);
  if (!standardId) throw new Error("Failed to get Standard ID from response");
  onLog({ text: `✓ Standard created (${standardId})`, status: "done" });

  onLog({ text: `Creating Subject: ${plan.subject.name}…`, status: "running" });
  const subRes    = await createSubject({ ...plan.subject, orderIndex: plan.subject.order, standardId });
  const subjectId = extractId(subRes);
  if (!subjectId) throw new Error("Failed to get Subject ID from response");
  onLog({ text: `✓ Subject created (${subjectId})`, status: "done" });

  onLog({ text: `Creating Unit: ${plan.unit.name}…`, status: "running" });
  const unitRes = await createUnit({ ...plan.unit, orderIndex: plan.unit.order, subjectId });
  const unitId  = extractId(unitRes);
  if (!unitId) throw new Error("Failed to get Unit ID from response");
  onLog({ text: `✓ Unit created (${unitId})`, status: "done" });

  const chapterCount = plan.chapters.length;
  const lessonCount  = plan.chapters.reduce((t, c) => t + (c.lessons?.length ?? 0), 0);

  for (const chapter of plan.chapters) {
    const { lessons = [], ...chapterData } = chapter;
    onLog({ text: `Creating Chapter ${chapterData.order}: ${chapterData.name}…`, status: "running" });
    const chRes     = await createChapter({ ...chapterData, orderIndex: chapterData.order, unitId });
    const chapterId = extractId(chRes);
    if (!chapterId) throw new Error(`Failed to get Chapter ID for "${chapterData.name}"`);
    onLog({ text: `✓ Chapter ${chapterData.order} created (${chapterId})`, status: "done" });

    for (const lesson of lessons) {
      onLog({ text: `  Creating Lesson ${chapterData.order}.${lesson.order}: ${lesson.title}…`, status: "running" });
      const { quiz, order, content, description, ...lessonPayload } = lesson;
      const contentText = description ? `${description}\n\n${content || ""}` : (content || "");
      const lRes     = await createLesson({ ...lessonPayload, orderIndex: order, contentText, chapterId });
      const lessonId = extractId(lRes);
      onLog({ text: `  ✓ Lesson created (${lessonId})`, status: "done" });

      if (quiz && quiz.questions) {
        onLog({ text: `    Creating Quiz for Lesson...`, status: "running" });
        try {
          const formattedQuestions = quiz.questions.map((q, qIdx) => ({
             qid: `q${qIdx}`,
             prompt: q.prompt,
             options: q.options,
             answerIndex: q.answerIndex
          }));
          await apiFetch("/v1/admin/quizzes/version", {
            method: "POST",
            body: JSON.stringify({
              lessonId,
              version: 1,
              published: true,
              questions: formattedQuestions,
              difficulty: "medium",
              source: "seed"
            })
          });
          onLog({ text: `    ✓ Quiz published successfully`, status: "done" });
        } catch (quizErr) {
          onLog({ text: `    ❌ Quiz failed: ${quizErr.message}`, status: "error" });
        }
      }
    }
  }

  // --- AUTOMATIC PROFILE SYNC ---
  // We automatically update the current user's profile to use the new standard.
  // This ensures the developer/admin sees the content on the Dashboard immediately.
  onLog({ text: `Syncing your profile to the new grade…`, status: "running" });
  try {
    const meRes = await apiFetch("/v1/me");
    const meData = meRes?.data || meRes;
    await apiFetch("/v1/me/onboarding", {
      method: "PATCH",
      body: JSON.stringify({
        fullName: meData?.profile?.fullName || "Learner",
        standard: standardId, // Set to the newly created ObjectId
        timezone: meData?.profile?.timezone || "Asia/Kolkata",
      }),
    });
    onLog({ text: `✓ Profile synced to Standard ID: ${standardId}`, status: "done" });
  } catch (syncErr) {
    onLog({ text: `⚠️ Profile sync skipped: ${syncErr.message}`, status: "done" });
  }

  onLog({
    text:   `🎉 Seed complete! 1 Standard · 1 Subject · 1 Unit · ${chapterCount} Chapters · ${lessonCount} Lessons & Quizzes`,
    status: "success",
  });
}

export default function SeedPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();

  const [jsonText,    setJsonText]    = useState("");
  const [jsonError,   setJsonError]   = useState("");
  const [seedLogs,    setSeedLogs]    = useState([]);
  const [seedRunning, setSeedRunning] = useState(false);
  const [seedDone,    setSeedDone]    = useState(false);
  const [parsed,      setParsed]      = useState(null);

  // Initialize jsonText safely after mount
  useEffect(() => {
    setJsonText(JSON.stringify(SEED_TEMPLATE, null, 2));
  }, []);

  useEffect(() => {
    if (!jsonText) return;
    try {
      const p = JSON.parse(jsonText);
      setParsed(p);
      setJsonError("");
    } catch (e) {
      setParsed(null);
      setJsonError(e.message);
    }
  }, [jsonText]);

  const chapterCount = parsed?.chapters?.length ?? 0;
  const lessonCount  = parsed?.chapters?.reduce((t, c) => t + (c.lessons?.length ?? 0), 0) ?? 0;

  const handleRunSeed = async () => {
    if (!parsed) return;
    setSeedRunning(true);
    setSeedLogs([]);
    setSeedDone(false);
    try {
      await runSeed(parsed, (log) => setSeedLogs((prev) => [...prev, log]));
      setSeedDone(true);
    } catch (err) {
      setSeedLogs((prev) => [...prev, { text: `❌ Error: ${err.message}`, status: "error" }]);
    } finally {
      setSeedRunning(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-background-light dark:bg-background-dark" />;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white p-4">
      <header className="flex items-center gap-3 mb-6 max-w-4xl mx-auto">
        <button onClick={() => router.push("/admin")} className="p-2 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-bold">Curriculum Seed Center</h1>
          <p className="text-xs text-slate-500">Insert raw JSON to bulk create standards, subjects, modules, lessons and quizzes.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col h-[70vh]">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Seed Plan (JSON)</label>
              <button onClick={() => setJsonText(JSON.stringify(SEED_TEMPLATE, null, 2))} className="text-[10px] text-primary hover:underline uppercase font-bold tracking-wider">Reset Defaults</button>
            </div>
            <textarea
              className="flex-1 w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-background-dark text-xs font-mono resize-none focus:outline-none focus:border-primary transition"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
            {jsonError && <p className="text-[11px] text-red-500 mt-2 font-mono font-bold bg-red-500/10 p-2 rounded-lg">{jsonError}</p>}
          </div>
        </div>

        <div className="space-y-4 flex flex-col">
          {parsed && !jsonError && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark p-5 shadow-sm space-y-4">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Preview Layout</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Standard</span>
                  <span className="font-semibold">{parsed.standard?.name ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Subject</span>
                  <span className="font-semibold">{parsed.subject?.name ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Chapters</span>
                  <span className="font-semibold">{chapterCount} total</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Lessons/Quizzes</span>
                  <span className="font-semibold">{lessonCount} items</span>
                </div>
              </div>

              <button
                onClick={handleRunSeed}
                disabled={seedRunning || !parsed || !!jsonError}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-2 shadow-lg shadow-primary/20"
              >
                {seedRunning
                  ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Executing Sequence…</>
                  : seedDone
                  ? <><span className="material-symbols-outlined text-[18px]">replay</span>Run Pipeline Again</>
                  : <><span className="material-symbols-outlined text-[18px]">bolt</span>Run Seeding Pipeline</>
                }
              </button>

              {seedDone && (
                <div className="pt-2 animate-in slide-in-from-top-4 duration-500">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-3 border border-emerald-400/20 group"
                  >
                    <span className="material-symbols-rounded group-hover:translate-x-1 transition-transform">dashboard</span>
                    GO TO DASHBOARD
                  </button>
                </div>
              )}
            </div>
          )}

          {seedLogs.length > 0 && (
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-2 font-mono text-xs shadow-inner min-h-[300px]">
              {seedLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="shrink-0 text-slate-500">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                  <p className={`leading-relaxed ${log.status === "error" ? "text-red-400 font-bold" : log.status === "success" ? "text-emerald-400 font-bold" : log.status === "done" ? "text-slate-300" : "text-amber-400"}`}>
                    {log.text}
                  </p>
                </div>
              ))}
              {seedRunning && (
                <div className="flex items-center gap-2 pt-2 text-amber-500 animate-pulse">
                  <div className="h-3 w-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p>Processing payload...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
