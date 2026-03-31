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
    "description": "Fun and Easy Data Science for 8th Graders",
    "order": 8
  },
  "subject": {
    "name": "Data Science",
    "description": "Learn how computers use data to do amazing things!",
    "order": 1
  },
  "unit": {
    "name": "Introduction to Data",
    "description": "Let's explore what data is and how we visualize it.",
    "order": 1
  },
  "chapters": [
    {
      "name": "What is Data?",
      "description": "Let's learn what data means and the different shapes it takes.",
      "order": 1,
      "lessons": [
        {
          "title": "Welcome to Data!",
          "description": "Discover what data is in the simplest way possible.",
          "videoUrl": "https://youtu.be/i6tet4az1LU",
          "content": "## What is Data? \n\nData is just a fancy word for **information**. \n\nEvery time you send a text, play a video game, or take a picture with your phone, you are making data! \n\n### Types of Data\n- **Text:** Words, like the messages you type.\n- **Images:** Photos you take.\n- **Video:** TikTok or YouTube clips.\n- **Numbers:** Your math scores or high scores in games.\n- **Sound:** The music you listen to.\n\nComputers store all this info safely so you can use it anytime!",
          "order": 1,
          "quiz": {
            "title": "Quiz: What is Data?",
            "xpAwarded": 100,
            "questions": [
              {
                "prompt": "What is the simplest way to describe 'data'?",
                "options": ["Just numbers", "Any kind of information like text or pictures", "A type of computer screen", "Only videos"],
                "answerIndex": 1
              },
              {
                "prompt": "When you send a text message to your friend, are you creating data?",
                "options": ["Yes, always!", "No, texting isn't data", "Only if it has a picture", "Only if it is a long message"],
                "answerIndex": 0
              }
            ]
          }
        },
        {
          "title": "Numbers vs Words",
          "description": "Learn the basic difference between quantitative and qualitative data.",
          "videoUrl": "https://youtu.be/wV3berZhy4w",
          "content": "## Numbers vs Words\n\nSometimes data is numbers, and sometimes it's words. \n\n### Quantitative Data (Numbers)\nThis is data that gives us a **number**. \n- Example: You have **2** apples.\n- Example: Your dog weighs **15** kg.\n*Hint: It sounds like QUANTITY (how many)!*\n\n### Qualitative Data (Words)\nThis is data that gives us a **description** in words.\n- Example: The apple is **red** and **sweet**.\n- Example: Your dog is **fluffy**.\n*Hint: It sounds like QUALITY (what is it like)!*",
          "order": 2,
          "quiz": {
            "title": "Quiz: Numbers vs Words",
            "xpAwarded": 100,
            "questions": [
              {
                "prompt": "Which of these is Quantitative Data (Numbers)?",
                "options": ["The car is fast", "The pizza is yummy", "I have 3 cats", "The sky is blue"],
                "answerIndex": 2
              },
              {
                "prompt": "Which of these is Qualitative Data (Words)?",
                "options": ["I am 14 years old", "The weather is super sunny", "We drove 10 miles", "My brother ate 4 cookies"],
                "answerIndex": 1
              }
            ]
          }
        }
      ]
    },
    {
      "name": "Drawing the Data",
      "description": "See how we can turn boring numbers into pretty graphs.",
      "order": 2,
      "lessons": [
        {
          "title": "Making Data Pretty",
          "description": "Learn why we draw graphs instead of looking at tables.",
          "videoUrl": "https://youtu.be/JyvE-TUClWI",
          "content": "## Why Do We Draw Graphs?\n\nImagine staring at a huge list of 1000 numbers. Boring, right? \n\nIf we turn those numbers into a **Graph** or a **Chart**, our brains can understand the information much faster! \n\n### Types of Simple Charts\n- **Bar Chart:** Great for comparing things. (Who likes apples vs bananas?)\n- **Pie Chart:** Great for seeing slices of a whole. (What slice of the class likes pizza?)\n- **Line Chart:** Great for time. (How did my height change from age 5 to 10?)\n\nGraphs make data fun and easy to look at!",
          "order": 1,
          "quiz": {
            "title": "Quiz: Making Data Pretty",
            "xpAwarded": 100,
            "questions": [
              {
                "prompt": "Why do we use graphs instead of big tables of numbers?",
                "options": ["Because they are harder to read", "Because they help our brains understand the information fast", "Because computers can't read numbers", "To waste time"],
                "answerIndex": 1
              },
              {
                "prompt": "Which chart is shaped like a pizza?",
                "options": ["Bar Chart", "Line Chart", "Pie Chart", "Dot Chart"],
                "answerIndex": 2
              }
            ]
          }
        }
      ]
    },
    {
      "name": "Smart Computers (AI)",
      "description": "How computers learn to think almost like human beings.",
      "order": 3,
      "lessons": [
        {
          "title": "What is AI?",
          "description": "Discover Artificial Intelligence in a really easy way.",
          "videoUrl": "https://youtu.be/gak8JChIEp4",
          "content": "## What is Artificial Intelligence (AI)?\n\nAI means **Artificial Intelligence**. \n\nIt is just a way to make computers act really smart! Instead of only doing exactly what we type, an AI can sometimes figure things out on its own.\n\n### Everyday AI Examples\n- **YouTube Recommendations:** AI figures out what videos you like.\n- **Voice Assistants:** Siri or Alexa understands your voice.\n- **Face Unlock:** Your phone's camera recognizes your face to unlock it.\n\nAI isn't magic; it's just computers matching patterns super fast!",
          "order": 1,
          "quiz": {
            "title": "Quiz: What is AI?",
            "xpAwarded": 100,
            "questions": [
              {
                "prompt": "What does AI stand for?",
                "options": ["Awesome Internet", "Artificial Intelligence", "Automatic Information", "Any Idea"],
                "answerIndex": 1
              },
              {
                "prompt": "Which of these uses AI?",
                "options": ["A wooden pencil", "A regular notebook", "Face unlock on a smartphone", "A plastic ruler"],
                "answerIndex": 2
              }
            ]
          }
        }
      ]
    }
  ]
};

function extractId(res) {
  return res?.data?._id ?? res?.data?.id ?? res?._id ?? res?.id ?? null;
}

async function runSeed(plan, onLog) {
  onLog({ text: `Creating Standard: ${plan.standard.name}…`, status: "running" });
  const stdRes     = await createStandard({ ...plan.standard, orderIndex: plan.standard.order });
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
            </div>
          )}

          {seedLogs.length > 0 && (
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-2 font-mono text-xs shadow-inner">
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
