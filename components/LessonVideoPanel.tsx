"use client";

import { useState, useCallback } from "react";
import { updateLesson } from "../lib/admin-api";

interface Script {
  hook:        string;
  explanation: string;
  example:     string;
  summary:     string;
  fullScript:  string;
}

type Stage = "idle" | "generating" | "ready" | "saving" | "saved" | "error";

interface Props {
  lessonId:         string;
  lessonTitle:      string;
  lessonContent?:   string;
  chapterName?:     string;
  subjectName?:     string;
  currentVideoUrl?: string;
  onSaved?:         (videoUrl: string) => void;
}

const SECTIONS = [
  { key: "hook"        as keyof Script, label: "Hook",               emoji: "🎣", hint: "Opening question — ~10 sec", rows: 3 },
  { key: "explanation" as keyof Script, label: "Explanation",        emoji: "📖", hint: "Core concept — ~40 sec",     rows: 5 },
  { key: "example"     as keyof Script, label: "Real-World Example", emoji: "🌍", hint: "Indian example — ~20 sec",   rows: 4 },
  { key: "summary"     as keyof Script, label: "Summary",            emoji: "✅", hint: "Recap + cheer — ~10 sec",    rows: 3 },
] as const;

// ── helpers ────────────────────────────────────────────────────────────────

function extractJSON(raw: string): Record<string, string> {
  let cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Salvage truncated JSON by trimming to the last complete key-value pair
    const lastComma = cleaned.lastIndexOf(",");
    const lastBrace = cleaned.lastIndexOf("}");
    if (lastComma > lastBrace) {
      cleaned = cleaned.substring(0, lastComma) + "}";
    }
    return JSON.parse(cleaned); // throws naturally if still broken
  }
}

// ── component ──────────────────────────────────────────────────────────────

export default function LessonVideoPanel({
  lessonId,
  lessonTitle,
  lessonContent   = "",
  chapterName     = "",
  subjectName     = "Data Science",
  currentVideoUrl = "",
  onSaved,
}: Props) {
  const [stage,      setStage]      = useState<Stage>(currentVideoUrl ? "saved" : "idle");
  const [script,     setScript]     = useState<Script | null>(null);
  const [editingKey, setEditingKey] = useState<keyof Script | null>(null);
  const [videoUrl,   setVideoUrl]   = useState(currentVideoUrl);
  const [urlInput,   setUrlInput]   = useState(currentVideoUrl);
  const [error,      setError]      = useState("");
  const [copied,     setCopied]     = useState(false);

  // ── generate ──────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    setStage("generating");
    setError("");

    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_KEY ?? "";
    if (!geminiKey) {
      setError("NEXT_PUBLIC_GEMINI_KEY is not set in .env.local");
      setStage("error");
      return;
    }

    const prompt = `You are an experienced Indian school teacher writing short video scripts for Grade 8 CBSE students (age 13-14).

Scripts must be:
- Warm, encouraging, conversational — spoken directly to the student
- Using real Indian examples (cricket, UPI, Zomato, Bollywood, etc.)
- Simple English language only — no jargon unless teaching the term itself. Never mix Hindi or Hinglish words.
- Write in clear, simple English only — do NOT use Hindi, Hinglish, or any transliterated Hindi words (e.g. avoid: yaar, bilkul, matlab, achha, bas, etc.)
- Natural speech only — no bullet points, no markdown, no headers

Write a video script for this lesson:

Subject: ${subjectName}
Chapter: ${chapterName}
Lesson: ${lessonTitle}

Lesson Content:
---
${lessonContent.slice(0, 3000)}
---

Return ONLY this JSON (no markdown, no extra text, no code fences):
{
  "hook": "An attention-grabbing opening question or surprising fact. ~2 sentences. Spoken in 10 seconds.",
  "explanation": "Clear, simple explanation of the core concept. ~4-5 sentences. Spoken in 40 seconds.",
  "example": "One vivid real-world example an Indian student will instantly relate to. ~3 sentences. Spoken in 20 seconds.",
  "summary": "2-3 key takeaways. End with an encouraging line. Spoken in 10 seconds."
}`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
  temperature: 0.7,
  maxOutputTokens: 2048,
  responseMimeType: "application/json",
},
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? `Gemini API error ${res.status}`);
      }

      const data = await res.json();
      const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!raw) throw new Error("Gemini returned an empty response");

      const parsed = extractJSON(raw);

      for (const k of ["hook", "explanation", "example", "summary"] as const) {
        if (!parsed[k]) throw new Error(`Missing field in Gemini response: "${k}"`);
      }

      setScript({
        hook:        parsed.hook,
        explanation: parsed.explanation,
        example:     parsed.example,
        summary:     parsed.summary,
        fullScript:  [parsed.hook, parsed.explanation, parsed.example, parsed.summary]
          .map((s) => s.trim())
          .join("\n\n"),
      });
      setStage("ready");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong generating the script");
      setStage("error");
    }
  }, [lessonTitle, lessonContent, chapterName, subjectName]);

  // ── edit / copy ───────────────────────────────────────────────────────────

  const handleEdit = (key: keyof Script, value: string) => {
    if (!script) return;
    const updated = { ...script, [key]: value };
    if (key !== "fullScript") {
      updated.fullScript = [updated.hook, updated.explanation, updated.example, updated.summary].join("\n\n");
    }
    setScript(updated);
  };

  const handleCopy = async () => {
    if (!script) return;
    await navigator.clipboard.writeText(script.fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── save URL ──────────────────────────────────────────────────────────────

  const handleSaveUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setStage("saving");
    setError("");
    try {
      await updateLesson(lessonId, { videoUrl: url });
      setVideoUrl(url);
      setStage("saved");
      onSaved?.(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save video URL");
      setStage("ready");
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="mt-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">smart_display</span>
          <span className="font-bold text-sm">Lesson Video</span>
        </div>
        <StagePill stage={stage} />
      </div>

      <div className="p-4 space-y-4">

        {/* error banner */}
        {error && (
          <div className="flex gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
            <span className="text-red-500 shrink-0 text-sm">❌</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 break-words">{error}</p>
              <button
                onClick={() => { setError(""); setStage(script ? "ready" : "idle"); }}
                className="text-xs text-red-400 underline mt-0.5"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* idle */}
        {stage === "idle" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] p-5 text-center">
              <div className="text-3xl mb-2">🎬</div>
              <p className="text-xs text-slate-500">
                No video yet. Generate a script with AI, create in D-ID Studio (free), paste URL back here.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-orange-600 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Generate Script with AI
            </button>
            <div className="pt-1">
              <p className="text-[11px] text-slate-400 mb-2">Or paste an existing video URL directly:</p>
              <UrlInput urlInput={urlInput} setUrlInput={setUrlInput} onSave={handleSaveUrl} saving={false} />
            </div>
          </div>
        )}

        {/* generating */}
        {stage === "generating" && (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="font-bold text-sm">Writing script…</p>
            <p className="text-xs text-slate-500 text-center">
              Gemini is reading the lesson and crafting an ~80 second teaching script
            </p>
          </div>
        )}

        {/* ready / saving */}
        {(stage === "ready" || stage === "saving") && script && (
          <div className="space-y-3">
            {SECTIONS.map(({ key, label, emoji, hint, rows }) => (
              <div key={key} className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm leading-none">{emoji}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{hint}</span>
                </div>
                <div className="p-3">
                  {editingKey === key ? (
                    <textarea
                      autoFocus
                      rows={rows}
                      value={script[key]}
                      onChange={(e) => handleEdit(key, e.target.value)}
                      onBlur={() => setEditingKey(null)}
                      className="w-full text-sm bg-transparent resize-none outline-none leading-relaxed text-slate-700 dark:text-slate-200"
                    />
                  ) : (
                    <p
                      onClick={() => setEditingKey(key)}
                      title="Click to edit"
                      className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 cursor-text hover:bg-primary/5 rounded px-1 -mx-1 py-0.5 transition-colors"
                    >
                      {script[key]}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* full script */}
            <details className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <summary className="px-3 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors select-none">
                Full script — expand to edit &amp; copy
              </summary>
              <div className="p-3">
                <textarea
                  rows={10}
                  value={script.fullScript}
                  onChange={(e) => setScript({ ...script, fullScript: e.target.value })}
                  className="w-full text-sm font-mono bg-transparent resize-y outline-none leading-relaxed text-slate-700 dark:text-slate-200"
                />
              </div>
            </details>

            {/* action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                Redo
              </button>
              <button
                onClick={handleCopy}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{copied ? "check" : "content_copy"}</span>
                {copied ? "Copied!" : "Copy Script"}
              </button>
            </div>

            {/* D-ID instructions */}
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-3">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1.5">📋 Create video in D-ID Studio (free)</p>
              <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>Copy script above</li>
                <li>
                  Go to{" "}
                  <a href="https://studio.d-id.com" target="_blank" rel="noopener noreferrer" className="font-bold underline">
                    studio.d-id.com
                  </a>{" "}
                  → Create Video → Presenter
                </li>
                <li>Pick a female presenter → paste script → Generate</li>
                <li>Share → copy the video URL → paste below</li>
              </ol>
            </div>

            <UrlInput urlInput={urlInput} setUrlInput={setUrlInput} onSave={handleSaveUrl} saving={stage === "saving"} />
          </div>
        )}

        {/* saved */}
        {stage === "saved" && videoUrl && (
          <div className="space-y-3">
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10">
              <video src={videoUrl} controls className="w-full h-full" />
            </div>
            <div className="flex gap-2">
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                Open
              </a>
              <button
                onClick={() => { setStage("idle"); setScript(null); setVideoUrl(""); setUrlInput(""); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Replace
              </button>
            </div>
            <details className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <summary className="px-3 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors select-none">
                Update video URL
              </summary>
              <div className="p-3">
                <UrlInput urlInput={urlInput} setUrlInput={setUrlInput} onSave={handleSaveUrl} saving={false} />
              </div>
            </details>
          </div>
        )}

      </div>
    </div>
  );
}

// ── sub-components ─────────────────────────────────────────────────────────

function UrlInput({
  urlInput,
  setUrlInput,
  onSave,
  saving,
}: {
  urlInput:    string;
  setUrlInput: (v: string) => void;
  onSave:      () => void;
  saving:      boolean;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="url"
        placeholder="Paste D-ID video URL…"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSave()}
        className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors min-w-0"
      />
      <button
        onClick={onSave}
        disabled={!urlInput.trim() || saving}
        className="shrink-0 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-40"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

function StagePill({ stage }: { stage: Stage }) {
  const map: Record<Stage, { label: string; cls: string }> = {
    idle:       { label: "No video",     cls: "bg-slate-100 dark:bg-white/10 text-slate-500" },
    generating: { label: "Writing…",     cls: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 animate-pulse" },
    ready:      { label: "Script ready", cls: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" },
    saving:     { label: "Saving…",      cls: "bg-primary/10 text-primary animate-pulse" },
    saved:      { label: "✓ Video set",  cls: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
    error:      { label: "Error",        cls: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400" },
  };
  const { label, cls } = map[stage];
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}
