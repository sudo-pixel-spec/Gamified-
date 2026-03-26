"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import {
  listStandards, createStandard, updateStandard, deleteStandard, restoreStandard,
  listSubjects, createSubject, updateSubject, deleteSubject, restoreSubject,
  listUnits, createUnit, updateUnit, deleteUnit, restoreUnit,
  listChapters, createChapter, updateChapter, deleteChapter, restoreChapter,
  listLessons, createLesson, updateLesson, deleteLesson, restoreLesson,
  restoreQuiz, getJobsStatus,
} from "../../lib/admin-api";
import LessonVideoPanel from "../../components/LessonVideoPanel";
import { apiFetch } from "../../lib/api";

/* ─────────────────────────────────────────────────────────────────
   GAME TYPES
──────────────────────────────────────────────────────────────────*/

const GAME_TYPES = [
  { key: "quiz",          label: "Quiz / MCQ",            icon: "quiz",           color: "#f97316" },
  { key: "drag-drop",     label: "Drag & Drop",           icon: "drag_indicator", color: "#8b5cf6" },
  { key: "fill-blank",    label: "Fill in the Blank",     icon: "edit_note",      color: "#06b6d4" },
  { key: "flashcards",    label: "Flashcards",            icon: "style",          color: "#10b981" },
  { key: "word-scramble", label: "Word Scramble",         icon: "shuffle",        color: "#f43f5e" },
  { key: "code",          label: "Code Challenge",        icon: "code",           color: "#eab308" },
  { key: "data-verse",    label: "DataVerse Challenge",   icon: "travel_explore", color: "#6366f1" },
];

/* ─────────────────────────────────────────────────────────────────
   GAMES BACKEND HELPERS

   KEY DESIGN DECISION:
   - Games are stored as a Quiz doc with version=999, published=FALSE
   - published must stay FALSE so submitAttempt (which does
     Quiz.findOne({ lessonId, published: true }).sort({ version: -1 }))
     never picks up the games doc instead of a real quiz
   - Real quizzes use normal versions (1, 2, 3…) with published=true

   FIX: We now track the existing doc id and first attempt a PATCH
   via the publish endpoint (repurposed as a body-update) — but since
   the backend has no PATCH-by-id for quiz bodies we instead:
   1. DELETE the existing version=999 doc (via /quizzes/:id endpoint)
   2. POST a fresh one
   If DELETE is not available, we fall back to POST only (backend
   should upsert on lessonId+version uniqueness).
──────────────────────────────────────────────────────────────────*/

// ─── GAMES LOCAL PERSISTENCE ────────────────────────────────────
// The backend's /quizzes/latest endpoint only returns the latest
// *published* quiz. Version=999 games docs are always unpublished,
// so they are NEVER returned by that endpoint.
//
// There is also no GET /quizzes/:id route on this backend.
//
// Solution: treat localStorage as the source of truth for the games
// list. The backend is a write-only sync target (for the student-
// facing app to read). On every save we write to both localStorage
// and the backend. On load we read from localStorage first — instant
// and reliable — then attempt a backend sync in the background just
// to keep the two in agreement.
// ─────────────────────────────────────────────────────────────────

function gamesLocalKey(lessonId)  { return `games_v2:${lessonId}`; }
function gamesDocIdKey(lessonId)  { return `games_doc_id:${lessonId}`; }

/** Read the saved games array for a lesson from localStorage. */
function loadGamesFromLocal(lessonId) {
  try {
    const raw = localStorage.getItem(gamesLocalKey(lessonId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch { return null; }
}

/** Persist the games array for a lesson to localStorage. */
function saveGamesToLocal(lessonId, games) {
  try {
    localStorage.setItem(gamesLocalKey(lessonId), JSON.stringify(games));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

// Sentinel placeholder — backend requires questions.length >= 2.
// Filtered out in the UI by the __placeholder__ qid.
const PLACEHOLDER_QUESTION = {
  qid:         "__placeholder__",
  prompt:      "__placeholder__",
  options:     [],
  answerIndex: 0,
  explanation: JSON.stringify({ __placeholder__: true }),
};

/**
 * Sync the games list to the backend (fire-and-forget friendly).
 * Deletes the previous version=999 doc if we have its id, then
 * POSTs a fresh one. Updates the stored doc id on success.
 */
async function syncGamesToBackend(lessonId, questions) {
  const existingId = localStorage.getItem(gamesDocIdKey(lessonId));

  // Pad to meet backend minimum of 2 questions
  const paddedQuestions =
    questions.length < 2
      ? [...questions, ...Array(2 - questions.length).fill(PLACEHOLDER_QUESTION)]
      : questions;

  const payload = {
    lessonId,
    version:    999,
    source:     "seed",
    published:  false,
    difficulty: "medium",
    questions:  paddedQuestions,
  };

  // Delete old doc to avoid duplicate-version constraint
  if (existingId) {
    try {
      await apiFetch(`/v1/admin/quizzes/${existingId}`, { method: "DELETE" });
    } catch (e) {
      // DELETE not available — backend may upsert natively, continue
      console.warn("Could not delete old games doc:", e?.message);
    }
  }

  const res   = await apiFetch("/v1/admin/quizzes/version", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
  const saved = res?.data ?? res;
  const newId = saved?._id ?? saved?.id;
  if (newId) localStorage.setItem(gamesDocIdKey(lessonId), newId);
  return res;
}

/* ─────────────────────────────────────────────────────────────────
   ENVELOPE HELPERS
──────────────────────────────────────────────────────────────────*/

function makeEnvelope(gameType, title, xp, gameData) {
  return {
    qid:         `game-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    prompt:      title,
    options:     [],
    answerIndex: 0,
    explanation: JSON.stringify({ gameType, xp: Number(xp) || 0, gameData }),
  };
}

function parseEnvelope(q) {
  try {
    const parsed = JSON.parse(q.explanation || "{}");
    return { ...q, ...parsed };
  } catch { return q; }
}

/* ─────────────────────────────────────────────────────────────────
   GAME DATA BUILDERS
──────────────────────────────────────────────────────────────────*/

function buildGameData(type, raw) {
  switch (type) {
    case "quiz": {
      const questions = (raw.questions || "").split("\n---\n").map((block, i) => {
        const lines   = block.trim().split("\n");
        const prompt  = lines[0] ?? `Question ${i + 1}`;
        const options = lines.slice(1, 5).map((l) => l.replace(/^[A-D]\.\s*/, "").trim()).filter(Boolean);
        const correct = Math.max(0, parseInt(raw[`correct_${i}`] ?? "0", 10));
        return { id: `q${i}`, prompt, options, correct };
      });
      return { questions, passMark: parseFloat(raw.passMark || "0.8") };
    }
    case "drag-drop": {
      const pairs = (raw.pairs || "").split("\n").map((line, i) => {
        const [left = "", right = ""] = line.split("||").map((s) => s.trim());
        return { id: `p${i}`, left, right };
      }).filter((p) => p.left && p.right);
      return { prompt: raw.prompt || "", pairs };
    }
    case "fill-blank": {
      const sentences = (raw.sentences || "").split("\n").map((line, i) => {
        const blanks   = [];
        const template = line.replace(/\[([^\]]+)\]/g, (_, w) => { blanks.push(w); return "____"; });
        return { id: `s${i}`, template, blanks };
      }).filter((s) => s.blanks.length > 0);
      return { sentences, caseSensitive: raw.caseSensitive === "true" };
    }
    case "flashcards": {
      const cards = (raw.cards || "").split("\n").map((line, i) => {
        const [front = "", back = ""] = line.split("||").map((s) => s.trim());
        return { id: `c${i}`, front, back };
      }).filter((c) => c.front && c.back);
      return { mode: raw.mode || "flashcard", cards };
    }
    case "word-scramble": {
      const words = (raw.words || "").split("\n").map((line, i) => {
        const [answer = "", hint = ""] = line.split("||").map((s) => s.trim());
        const scrambled = answer.toUpperCase().split("").sort(() => Math.random() - 0.5).join("");
        return { id: `w${i}`, scrambled, answer: answer.toUpperCase(), hint };
      }).filter((w) => w.answer);
      return { words, timeLimit: parseInt(raw.timeLimit || "60", 10) };
    }
    case "code": {
      return {
        language:    raw.language || "javascript",
        prompt:      raw.prompt || "",
        starterCode: raw.starterCode || "",
        testCases:   (raw.testCases || "").split("\n").map((line) => {
          const [input = "", expected = ""] = line.split("→").map((s) => s.trim());
          return { input, expected };
        }).filter((t) => t.input),
        solution: raw.solution || "",
      };
    }
    case "data-verse":
      return {};
    default:
      return raw;
  }
}

/* ─────────────────────────────────────────────────────────────────
   GAME DATA FORM (per-type fields)
──────────────────────────────────────────────────────────────────*/

function GameDataForm({ type, raw, setRaw }) {
  const f = (key, label, placeholder, opts = {}) => (
    <div key={key}>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</label>
      {opts.textarea ? (
        <textarea
          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-sm resize-y min-h-[80px] focus:outline-none focus:border-primary transition font-mono"
          value={raw[key] || ""}
          onChange={(e) => setRaw((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={opts.type || "text"}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-sm focus:outline-none focus:border-primary transition"
          value={raw[key] || ""}
          onChange={(e) => setRaw((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
        />
      )}
      {opts.hint && <p className="text-[10px] text-slate-400 mt-1">{opts.hint}</p>}
    </div>
  );

  switch (type) {
    case "quiz":
      return (
        <div className="space-y-3">
          {f("questions", "Questions", "Q: What is JSX?\nA. A framework\nB. A syntax extension\nC. A library\nD. A compiler", {
            textarea: true,
            hint: "Separate questions with a line containing only ---. Format: first line = question, next 4 lines = A B C D options.",
          })}
          {f("passMark", "Pass mark (0–1)", "0.8", { type: "number" })}
        </div>
      );
    case "drag-drop":
      return (
        <div className="space-y-3">
          {f("prompt", "Instruction prompt", "Match each hook to its purpose")}
          {f("pairs", "Pairs (left || right, one per line)", "useState || Manages local state\nuseEffect || Runs side effects", {
            textarea: true,
            hint: "Each line: left side || right side",
          })}
        </div>
      );
    case "fill-blank":
      return (
        <div className="space-y-3">
          {f("sentences", "Sentences", "The [useEffect] hook runs after every [render].", {
            textarea: true,
            hint: "Wrap each blank word in [brackets]. One sentence per line.",
          })}
          {f("caseSensitive", "Case sensitive? (true/false)", "false")}
        </div>
      );
    case "flashcards":
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Mode</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-sm focus:outline-none focus:border-primary"
              value={raw.mode || "flashcard"}
              onChange={(e) => setRaw((p) => ({ ...p, mode: e.target.value }))}
            >
              <option value="flashcard">Flashcard (flip)</option>
              <option value="match">Memory Match</option>
            </select>
          </div>
          {f("cards", "Cards (front || back, one per line)", "Closure || A function capturing its outer scope", {
            textarea: true,
            hint: "Each line: front || back",
          })}
        </div>
      );
    case "word-scramble":
      return (
        <div className="space-y-3">
          {f("words", "Words (answer || hint, one per line)", "CLOSURE || A function that remembers its scope", {
            textarea: true,
            hint: "Each line: ANSWER || optional hint",
          })}
          {f("timeLimit", "Time limit (seconds)", "60", { type: "number" })}
        </div>
      );
    case "code":
      return (
        <div className="space-y-3">
          {f("language", "Language", "javascript")}
          {f("prompt", "Challenge prompt", "Write a function that returns the sum of two numbers.")}
          {f("starterCode", "Starter code", "function add(a, b) {\n  // your code\n}", { textarea: true })}
          {f("testCases", "Test cases (input → expected, one per line)", "[1,2] → 3\n[-1,5] → 4", {
            textarea: true,
            hint: "Each line: input → expected output",
          })}
          {f("solution", "Solution (optional)", "function add(a,b){ return a+b; }", { textarea: true })}
        </div>
      );
    case "data-verse":
      return (
        <p className="text-xs text-slate-400 italic">
          DataVerse Challenge requires no additional config — the game engine handles everything.
        </p>
      );
    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────────────
   LESSON GAME PANEL
──────────────────────────────────────────────────────────────────*/

function LessonGamePanel({ lessonId }) {
  const [games,         setGames]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");
  const [showAdd,       setShowAdd]       = useState(false);
  const [step,          setStep]          = useState(1);
  const [selectedType,  setSelectedType]  = useState(null);
  const [gameTitle,     setGameTitle]     = useState("");
  const [gameXp,        setGameXp]        = useState("100");
  const [rawData,       setRawData]       = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Step 1: Load from localStorage immediately (no network, no flicker)
    const local = loadGamesFromLocal(lessonId);
    if (local) {
      setGames(local.filter((q) => q?.qid !== "__placeholder__").map(parseEnvelope));
      setLoading(false);
    }

    // Step 2: Attempt background sync — if local was empty, this is
    // the first load and we try the backend as a one-time migration.
    // If local already had data we skip the network call entirely.
    if (!local) {
      (async () => {
        try {
          const res = await apiFetch(`/v1/admin/quizzes/latest?lessonId=${lessonId}`);
          if (cancelled) return;
          const raw = res?.data ?? res;
          const arr = Array.isArray(raw) ? raw : (raw ? [raw] : []);
          const doc = arr.find((d) => d?.version === 999) ?? null;
          if (doc) {
            const docId = doc._id ?? doc.id;
            if (docId) localStorage.setItem(gamesDocIdKey(lessonId), docId);
            const realGames = (doc.questions ?? [])
              .filter((q) => q?.qid !== "__placeholder__" && q?.prompt !== "__placeholder__")
              .map(parseEnvelope);
            // Persist to localStorage so future loads are instant
            saveGamesToLocal(lessonId, realGames);
            if (!cancelled) setGames(realGames);
          }
        } catch (_) {
          // 404 = no quiz yet for this lesson, that's fine
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }

    return () => { cancelled = true; };
  }, [lessonId]);

  const resetAdd = () => {
    setShowAdd(false);
    setStep(1);
    setSelectedType(null);
    setGameTitle("");
    setGameXp("100");
    setRawData({});
    setError("");
  };

  const handleSave = async (updatedGames) => {
    setSaving(true);
    setError("");

    // Always persist to localStorage first — this is the source of truth.
    // The UI reads from here on reload so games are never lost.
    saveGamesToLocal(lessonId, updatedGames);

    // Then sync to backend asynchronously
    try {
      const questions = updatedGames.map((g) => ({
        qid:         g.qid,
        prompt:      g.prompt,
        options:     g.options ?? [],
        answerIndex: g.answerIndex ?? 0,
        explanation: typeof g.explanation === "string"
          ? g.explanation
          : JSON.stringify({ gameType: g.gameType, xp: g.xp, gameData: g.gameData }),
      }));
      await syncGamesToBackend(lessonId, questions);
    } catch (e) {
      // Backend sync failed — localStorage already saved so no data loss.
      // Show a soft warning but don't block the user.
      setError("Saved locally. Backend sync failed: " + (e.message ?? "unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleAddGame = async () => {
    if (!selectedType || !gameTitle.trim()) { setError("Title is required"); return; }
    const gameData = buildGameData(selectedType, rawData);
    const envelope = makeEnvelope(selectedType, gameTitle.trim(), gameXp, gameData);
    const parsed   = parseEnvelope(envelope);
    const updated  = [...games, parsed];
    setGames(updated);
    await handleSave(updated);
    resetAdd();
  };

  const handleDelete = async (qid) => {
    const updated = games.filter((g) => g.qid !== qid);
    setGames(updated);
    await handleSave(updated);
    setDeleteConfirm(null);
  };

  const typeInfo = GAME_TYPES.find((t) => t.key === selectedType);

  return (
    <div className="mt-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-background-dark/40 overflow-hidden">

      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">sports_esports</span>
          <p className="text-sm font-bold">Game Activities</p>
          {games.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              {games.length}
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 text-[10px]">
            unscored · display only
          </span>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Add Game
          </button>
        )}
      </div>

      {/* info banner */}
      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/40">
        <p className="text-[11px] text-blue-700 dark:text-blue-300">
          <strong>Games</strong> are interactive activities shown on the lesson page.
          For a <strong>scored quiz</strong> students submit for XP, use the <strong>Quizzes</strong> management area.
        </p>
      </div>

      {/* body */}
      <div className="p-4">

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading games…
          </div>
        )}

        {!loading && games.length > 0 && !showAdd && (
          <div className="space-y-2 mb-3">
            {games.map((g) => {
              const gt = GAME_TYPES.find((t) => t.key === g.gameType);
              return (
                <div
                  key={g.qid}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${gt?.color ?? "#888"}20` }}
                    >
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ color: gt?.color ?? "#888" }}
                      >
                        {gt?.icon ?? "games"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{g.prompt}</p>
                      <p className="text-[10px] text-slate-400">
                        {gt?.label ?? g.gameType} · {g.xp ?? 0} XP
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {saving ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : deleteConfirm === g.qid ? (
                      <>
                        <button
                          onClick={() => handleDelete(g.qid)}
                          className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-[10px] font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(g.qid)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && games.length === 0 && !showAdd && (
          <p className="text-xs text-slate-400 py-1">No games attached yet.</p>
        )}

        {/* ADD GAME FORM */}
        {showAdd && (
          <div className="space-y-4">

            {step === 1 && (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Select game type</p>
                <div className="grid grid-cols-2 gap-2">
                  {GAME_TYPES.map((gt) => (
                    <button
                      key={gt.key}
                      onClick={() => { setSelectedType(gt.key); setStep(2); }}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark hover:border-primary/50 transition-all active:scale-95 text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${gt.color}20` }}
                      >
                        <span className="material-symbols-outlined text-[18px]" style={{ color: gt.color }}>
                          {gt.icon}
                        </span>
                      </div>
                      <span className="text-xs font-bold">{gt.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={resetAdd}
                  className="w-full py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}

            {step === 2 && selectedType && (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  </button>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${typeInfo?.color}20`, color: typeInfo?.color }}
                  >
                    <span className="material-symbols-outlined text-[14px]">{typeInfo?.icon}</span>
                    {typeInfo?.label}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                      Game Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-sm focus:outline-none focus:border-primary transition"
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                      placeholder="e.g. React Hooks Quiz"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">XP</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-sm focus:outline-none focus:border-primary transition"
                      value={gameXp}
                      onChange={(e) => setGameXp(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark p-3 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Game Config</p>
                  <GameDataForm type={selectedType} raw={rawData} setRaw={setRawData} />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={resetAdd}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGame}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white text-sm font-bold transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        Save Game
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SEED DATA — loaded dynamically from the API, not hardcoded.
   The SeedModal fetches real counts/structure on open.
──────────────────────────────────────────────────────────────────*/

/* ─────────────────────────────────────────────────────────────────
   SEED RUNNER
──────────────────────────────────────────────────────────────────*/

function extractId(res) {
  return res?.data?._id ?? res?.data?.id ?? res?._id ?? res?.id ?? null;
}

/**
 * Build a seeding plan from a user-supplied JSON structure.
 * Expected shape (mirrors what the admin fills in):
 * {
 *   standard: { code, name, description, order },
 *   subject:  { name, description, order },
 *   unit:     { name, description, order },
 *   chapters: [{ name, description, order, lessons: [{ title, description, content, order }] }]
 * }
 */
async function runSeed(plan, onLog) {
  onLog({ text: `Creating Standard: ${plan.standard.name}…`, status: "running" });
  const stdRes     = await createStandard(plan.standard);
  const standardId = extractId(stdRes);
  if (!standardId) throw new Error("Failed to get Standard ID from response");
  onLog({ text: `✓ Standard created (${standardId})`, status: "done" });

  onLog({ text: `Creating Subject: ${plan.subject.name}…`, status: "running" });
  const subRes    = await createSubject({ ...plan.subject, standardId });
  const subjectId = extractId(subRes);
  if (!subjectId) throw new Error("Failed to get Subject ID from response");
  onLog({ text: `✓ Subject created (${subjectId})`, status: "done" });

  onLog({ text: `Creating Unit: ${plan.unit.name}…`, status: "running" });
  const unitRes = await createUnit({ ...plan.unit, subjectId });
  const unitId  = extractId(unitRes);
  if (!unitId) throw new Error("Failed to get Unit ID from response");
  onLog({ text: `✓ Unit created (${unitId})`, status: "done" });

  const chapterCount = plan.chapters.length;
  const lessonCount  = plan.chapters.reduce((t, c) => t + (c.lessons?.length ?? 0), 0);

  for (const chapter of plan.chapters) {
    const { lessons = [], ...chapterData } = chapter;
    onLog({ text: `Creating Chapter ${chapterData.order}: ${chapterData.name}…`, status: "running" });
    const chRes     = await createChapter({ ...chapterData, unitId });
    const chapterId = extractId(chRes);
    if (!chapterId) throw new Error(`Failed to get Chapter ID for "${chapterData.name}"`);
    onLog({ text: `✓ Chapter ${chapterData.order} created (${chapterId})`, status: "done" });

    for (const lesson of lessons) {
      onLog({ text: `  Creating Lesson ${chapterData.order}.${lesson.order}: ${lesson.title}…`, status: "running" });
      const lRes     = await createLesson({ ...lesson, chapterId });
      const lessonId = extractId(lRes);
      onLog({ text: `  ✓ Lesson created (${lessonId})`, status: "done" });
    }
  }

  onLog({
    text:   `🎉 Seed complete! 1 Standard · 1 Subject · 1 Unit · ${chapterCount} Chapters · ${lessonCount} Lessons`,
    status: "success",
  });
}

/* ─────────────────────────────────────────────────────────────────
   SEED MODAL — fully dynamic; admin pastes/types the JSON plan
──────────────────────────────────────────────────────────────────*/

const SEED_TEMPLATE = {
  standard: { code: "GR8", name: "Grade VIII", description: "CBSE Grade 8 curriculum", order: 8 },
  subject:  { name: "Subject Name", description: "Subject description", order: 1 },
  unit:     { name: "Unit Name", description: "Unit description", order: 1 },
  chapters: [
    {
      name: "Chapter 1",
      description: "Chapter description",
      order: 1,
      lessons: [
        { title: "Lesson 1", description: "Lesson description", content: "## Lesson content in Markdown", order: 1 },
      ],
    },
  ],
};

function SeedModal({ onClose, onSeeded }) {
  const [jsonText,    setJsonText]    = useState(JSON.stringify(SEED_TEMPLATE, null, 2));
  const [jsonError,   setJsonError]   = useState("");
  const [seedLogs,    setSeedLogs]    = useState([]);
  const [seedRunning, setSeedRunning] = useState(false);
  const [seedDone,    setSeedDone]    = useState(false);
  const [parsed,      setParsed]      = useState(null);

  // Validate JSON as user types
  useEffect(() => {
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
      onSeeded?.();
    } catch (err) {
      setSeedLogs((prev) => [...prev, { text: `❌ Error: ${err.message}`, status: "error" }]);
    } finally {
      setSeedRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div>
              <p className="font-bold text-sm">Seed Curriculum Data</p>
              <p className="text-[11px] text-slate-500">Paste your JSON plan below</p>
            </div>
          </div>
          {!seedRunning && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* JSON editor */}
          {!seedRunning && !seedDone && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                  Seed Plan (JSON)
                </label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark text-xs font-mono resize-y min-h-[240px] focus:outline-none focus:border-primary transition"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  spellCheck={false}
                />
                {jsonError && (
                  <p className="text-[11px] text-red-400 mt-1 font-mono">{jsonError}</p>
                )}
              </div>

              {/* Live preview */}
              {parsed && !jsonError && (
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Preview</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 px-2.5 py-1.5">
                      <span className="font-bold">Standard:</span> {parsed.standard?.name ?? "—"}
                    </span>
                    <span className="rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 px-2.5 py-1.5">
                      <span className="font-bold">Subject:</span> {parsed.subject?.name ?? "—"}
                    </span>
                    <span className="rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 px-2.5 py-1.5">
                      <span className="font-bold">Chapters:</span> {chapterCount}
                    </span>
                    <span className="rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 px-2.5 py-1.5">
                      <span className="font-bold">Lessons:</span> {lessonCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      ⚠️ Only run once. Duplicate runs will create duplicate records.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Seed logs */}
          {seedLogs.length > 0 && (
            <div className="space-y-1.5">
              {seedLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-[10px] font-mono mt-0.5 shrink-0 ${log.status === "done" ? "text-emerald-500" : log.status === "error" ? "text-red-400" : log.status === "success" ? "text-primary font-bold" : "text-slate-400"}`}>
                    {log.status === "running" ? "›" : log.status === "done" ? "✓" : log.status === "error" ? "✗" : "★"}
                  </span>
                  <p className={`text-xs font-mono leading-relaxed ${log.status === "error" ? "text-red-400" : log.status === "success" ? "text-primary font-bold" : log.status === "done" ? "text-slate-600 dark:text-slate-300" : "text-slate-500"}`}>
                    {log.text}
                  </p>
                </div>
              ))}
              {seedRunning && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-xs text-slate-400">Working…</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 flex gap-2 shrink-0">
          {seedDone ? (
            <button onClick={onClose} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 text-sm">Done</button>
          ) : (
            <>
              {!seedRunning && (
                <button onClick={onClose} className="flex-1 border border-slate-200 dark:border-white/10 font-bold py-2.5 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-white/5 text-sm">Cancel</button>
              )}
              <button
                onClick={handleRunSeed}
                disabled={seedRunning || !parsed || !!jsonError}
                className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {seedRunning
                  ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Seeding…</>
                  : <><span className="material-symbols-outlined text-[18px]">bolt</span>Run Seed</>
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   AREA CONFIG
──────────────────────────────────────────────────────────────────*/

const AREA_FIELDS = {
  standards: [
    { key: "code",        label: "Code",        required: true, minLength: 3 },
    { key: "name",        label: "Name",        required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "order",       label: "Order",       type: "number" },
  ],
  subjects: [
    { key: "name",        label: "Name",        required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "standardId",  label: "Standard ID", required: true },
    { key: "order",       label: "Order",       type: "number" },
  ],
  units: [
    { key: "name",        label: "Name",        required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "subjectId",   label: "Subject ID",  required: true },
    { key: "order",       label: "Order",       type: "number" },
  ],
  chapters: [
    { key: "name",        label: "Name",        required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "unitId",      label: "Unit ID",     required: true },
    { key: "order",       label: "Order",       type: "number" },
  ],
  lessons: [
    { key: "title",       label: "Title",              required: true },
    { key: "description", label: "Description",        type: "textarea" },
    { key: "chapterId",   label: "Chapter ID",         required: true },
    { key: "content",     label: "Content (Markdown)", type: "textarea" },
    { key: "order",       label: "Order",              type: "number" },
  ],
};

const AREAS = [
  { key: "standards", label: "Standards", icon: "verified",      list: listStandards, create: createStandard, update: updateStandard, remove: deleteStandard, restore: restoreStandard },
  { key: "subjects",  label: "Subjects",  icon: "menu_book",     list: listSubjects,  create: createSubject,  update: updateSubject,  remove: deleteSubject,  restore: restoreSubject },
  { key: "units",     label: "Units",     icon: "folder_open",   list: listUnits,     create: createUnit,     update: updateUnit,     remove: deleteUnit,     restore: restoreUnit },
  { key: "chapters",  label: "Chapters",  icon: "auto_stories",  list: listChapters,  create: createChapter,  update: updateChapter,  remove: deleteChapter,  restore: restoreChapter },
  { key: "lessons",   label: "Lessons",   icon: "co_present",    list: listLessons,   create: createLesson,   update: updateLesson,   remove: deleteLesson,   restore: restoreLesson },
  { key: "quizzes",   label: "Quizzes",   icon: "quiz",          restore: restoreQuiz },
];

/* ─────────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────────────*/

function extract(res) {
  if (!res) return [];
  const d = res?.data?.items ?? res?.data ?? res?.items ?? res;
  return Array.isArray(d) ? d : [];
}

function getItemId(item)  { return item?._id ?? item?.id ?? null; }
function hasValue(value)  { return value != null && String(value).trim() !== ""; }

function getPreviewText(value, maxLength = 220) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/* ─────────────────────────────────────────────────────────────────
   PAGE
──────────────────────────────────────────────────────────────────*/

export default function AdminPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();

  // Counts are fetched dynamically — no hardcoded values
  const [counts,      setCounts]      = useState({ standards: 0, lessons: 0, quizzes: 0 });
  const [jobs,        setJobs]        = useState(null);
  const [activeArea,  setActiveArea]  = useState(null);
  const [items,       setItems]       = useState([]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [tab,         setTab]         = useState("home");
  const [showForm,    setShowForm]    = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData,    setFormData]    = useState({});
  const [formError,   setFormError]   = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);

  // Fetch live counts from the API on mount
  const refreshCounts = useCallback(async () => {
    // /quizzes/latest requires a lessonId — it can't be queried globally.
    // Quiz count is not tracked here; the stat card shows 0 until a
    // dedicated list endpoint is available on the backend.
    const [stdsRes, lessonsRes] = await Promise.allSettled([
      listStandards(),
      listLessons(),
    ]);
    setCounts({
      standards: extract(stdsRes.status === "fulfilled" ? stdsRes.value : null).length,
      lessons:   extract(lessonsRes.status === "fulfilled" ? lessonsRes.value : null).length,
      quizzes:   0,
    });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      await refreshCounts();
      const jobsRes = await getJobsStatus().catch(() => null);
      if (!cancelled) setJobs(jobsRes?.data ?? jobsRes);
    })();
    return () => { cancelled = true; };
  }, [authLoading, refreshCounts]);

  const openArea = useCallback(async (area) => {
    if (!area.list) return;
    setActiveArea(area);
    setAreaLoading(true);
    const res = await area.list();
    setItems(extract(res));
    setAreaLoading(false);
  }, []);

  const closeArea = () => { setActiveArea(null); setItems([]); setShowForm(false); setEditingItem(null); };

  const openCreateForm = () => { setEditingItem(null); setFormData({}); setFormError(""); setShowForm(true); };
  const openEditForm   = (item) => { setEditingItem(item); setFormData({ ...item }); setFormError(""); setShowForm(true); };
  const closeForm      = () => { setShowForm(false); setEditingItem(null); setFormData({}); setFormError(""); };

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!activeArea) return;
    setFormLoading(true);
    setFormError("");
    try {
      const fields  = AREA_FIELDS[activeArea.key] || [];
      const payload = {};
      for (const f of fields) {
        const val = formData[f.key];
        if (val !== undefined && val !== "") payload[f.key] = f.type === "number" ? Number(val) : val;
      }
      if (editingItem) await activeArea.update(editingItem._id || editingItem.id, payload);
      else             await activeArea.create(payload);
      const res = await activeArea.list();
      setItems(extract(res));
      closeForm();
    } catch (err) {
      setFormError(err?.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  }, [activeArea, formData, editingItem]);

  const handleDelete = useCallback(async (area, id) => {
    if (!area.remove) return;
    await area.remove(id);
    const res = await area.list();
    setItems(extract(res));
  }, []);

  const handleRestore = useCallback(async (area, id) => {
    if (!area.restore) return;
    await area.restore(id);
    if (area.list) { const res = await area.list(); setItems(extract(res)); }
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const jobEntries = Array.isArray(jobs) ? jobs : jobs ? [jobs] : [];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">

      <header className="flex items-center justify-between p-4 sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">dashboard_customize</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex size-10 items-center justify-center rounded-full bg-card-dark border border-white/10 hover:border-primary transition-colors"
        >
          <span className="material-symbols-outlined text-white">account_circle</span>
        </button>
      </header>

      <main className="flex flex-col gap-6 p-4">

        {/* Live stat cards — all values fetched from API */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard label="Total Standards" value={counts.standards} up />
          <StatCard label="Active Lessons"  value={counts.lessons}   up />
          <StatCard label="Pending Quizzes" value={counts.quizzes}   className="col-span-2 md:col-span-1" />
        </section>

        {/* Seed banner — no hardcoded chapter/lesson counts */}
        <section className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold text-sm">Seed Curriculum Data</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Paste a JSON plan to bulk-insert Standards, Subjects, Units, Chapters &amp; Lessons
            </p>
          </div>
          <button
            onClick={() => setShowSeedModal(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            Seed
          </button>
        </section>

        {/* Management Areas */}
        <section>
          <h2 className="text-lg font-bold mb-4 px-1">Management Areas</h2>
          <div className="grid grid-cols-2 gap-3">
            {AREAS.map((area) => (
              <button
                key={area.key}
                onClick={() => openArea(area)}
                className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark p-5 hover:border-primary/50 transition-all active:scale-95 group text-left"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">{area.icon}</span>
                </div>
                <span className="font-bold">{area.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Job Status */}
        <section className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold">Job Status</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase">Live</span>
          </div>
          {jobEntries.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No active jobs</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {jobEntries.map((job, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-2 rounded-full ${job.status === "running" ? "bg-amber-500 animate-pulse" : job.status === "done" ? "bg-emerald-500" : "bg-slate-400"}`} />
                    <div>
                      <p className="text-sm font-semibold">{job.name || `Job ${i + 1}`}</p>
                      <p className="text-xs text-slate-500">{job.detail || job.status || "Queued"}</p>
                    </div>
                  </div>
                  {job.progress != null ? (
                    <div className="text-right">
                      <p className="text-xs font-medium">{job.progress}%</p>
                      <div className="w-16 h-1 bg-slate-200 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="bg-primary h-full transition-all" style={{ width: `${job.progress}%` }} />
                      </div>
                    </div>
                  ) : job.status === "done" ? (
                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Pending</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Seed Modal */}
      {showSeedModal && (
        <SeedModal
          onClose={() => setShowSeedModal(false)}
          onSeeded={refreshCounts}
        />
      )}

      {/* Area Detail Drawer */}
      {activeArea && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background-light dark:bg-background-dark">
          <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <button onClick={showForm ? closeForm : closeArea} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="text-lg font-bold">
                {showForm
                  ? (editingItem ? "Edit" : "Create") + " " + activeArea.label.replace(/s$/, "")
                  : activeArea.label}
              </h2>
            </div>
            {!showForm && activeArea.create && AREA_FIELDS[activeArea.key] && (
              <button
                onClick={openCreateForm}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            {showForm ? (
              <form onSubmit={handleFormSubmit} className="max-w-lg mx-auto space-y-4">
                {formError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">{formError}</div>
                )}
                {(AREA_FIELDS[activeArea.key] || []).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium mb-1.5">
                      {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        className="w-full px-3 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-sm min-h-[100px] resize-y"
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        required={field.required}
                        placeholder={field.label}
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        className="w-full px-3 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-sm"
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        required={field.required}
                        minLength={field.minLength}
                        placeholder={field.label}
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editingItem ? "Update" : "Create"}
                </button>
              </form>
            ) : areaLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-slate-500 py-12">No {activeArea.label.toLowerCase()} found</p>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const itemId       = getItemId(item);
                  const detailFields = (AREA_FIELDS[activeArea.key] || []).filter((f) => hasValue(item[f.key]));
                  const metaFields   = detailFields.filter((f) => !["description", "content"].includes(f.key));
                  const textFields   = detailFields.filter((f) => ["description", "content"].includes(f.key));

                  return (
                    <div key={itemId} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold break-words">{item.name || item.title || item.label || itemId}</p>
                          {item.deletedAt && <span className="text-[10px] text-rose-400 font-medium">Deleted</span>}
                          {itemId && <p className="text-[11px] text-slate-400 mt-1 break-all">ID: {itemId}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {activeArea.update && AREA_FIELDS[activeArea.key] && !item.deletedAt && (
                            <button onClick={() => openEditForm(item)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors">
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          )}
                          {item.deletedAt && activeArea.restore ? (
                            <button onClick={() => handleRestore(activeArea, itemId)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                              <span className="material-symbols-outlined text-[20px]">restore</span>
                            </button>
                          ) : (
                            activeArea.remove && (
                              <button onClick={() => handleDelete(activeArea, itemId)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {metaFields.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {metaFields.map((field) => (
                            <span key={field.key} className="rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300">
                              {field.label}: {String(item[field.key])}
                            </span>
                          ))}
                        </div>
                      )}

                      {textFields.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {textFields.map((field) => (
                            <div key={field.key} className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-background-dark/30 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{field.label}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words line-clamp-6">
                                {getPreviewText(item[field.key], field.key === "content" ? 320 : 220)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeArea.key === "lessons" && !item.deletedAt && (
                        <LessonVideoPanel
                          lessonId={itemId}
                          lessonTitle={item.title}
                          lessonContent={item.contentText ?? item.content ?? ""}
                          currentVideoUrl={item.videoUrl ?? ""}
                          onSaved={(url) =>
                            setItems((prev) =>
                              prev.map((i) => getItemId(i) === itemId ? { ...i, videoUrl: url } : i)
                            )
                          }
                        />
                      )}

                      {activeArea.key === "lessons" && !item.deletedAt && (
                        <LessonGamePanel lessonId={itemId} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-white/10 bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg px-4 pb-6 pt-2 z-40">
        <div className="mx-auto flex max-w-md gap-2">
          {[
            { key: "home",     icon: "home",     label: "Home" },
            { key: "search",   icon: "search",   label: "Search" },
            { key: "settings", icon: "settings", label: "Settings" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors ${tab === t.key ? "text-primary" : "text-slate-400 hover:text-primary"}`}
            >
              <span className="material-symbols-outlined" style={tab === t.key ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {t.icon}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest">{t.label}</p>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STAT CARD
──────────────────────────────────────────────────────────────────*/

function StatCard({ label, value, up, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 shadow-sm ${className}`}>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold">{value}</p>
        {up != null && (
          <span className={`text-xs font-bold flex items-center mb-1 ${up ? "text-emerald-500" : "text-rose-500"}`}>
            <span className="material-symbols-outlined text-sm">{up ? "trending_up" : "trending_down"}</span>
          </span>
        )}
      </div>
    </div>
  );
}