"use client";

import React from "react";

const Check = ({ ok, label }) => (
  <span className={`flex items-center gap-1 text-[11px] font-medium ${ok ? "text-emerald-400" : "text-rose-400"}`}>
    <span className="material-symbols-outlined text-[14px]">{ok ? "check_circle" : "cancel"}</span>
    {label}
  </span>
);

export default function LessonChecklist({ lesson, standards, chapters, quizStatusMap = {} }) {
  const mid = lesson._id || lesson.id;
  const hasVideo   = Boolean(lesson.videoUrl || lesson.video_url || (lesson.video && lesson.video !== "none"));
  const hasContent = Boolean((lesson.contentText || lesson.content_text || lesson.content || lesson.description || "").trim().length > 10);
  const hasQuiz    = quizStatusMap[mid] ?? Boolean(lesson.hasQuiz || lesson.has_quiz || lesson.quizId || lesson.quiz_id || lesson.quiz || lesson.quizzes?.length > 0 || (lesson.quizCount != null && lesson.quizCount > 0));

  const stdId  = lesson.standardId  || lesson.standard?.id  || lesson.standard?._id  || "—";
  const chapId = lesson.chapterId   || lesson.chapter?.id   || lesson.chapter?._id   || "—";

  const stdName  = standards.find(s => (s._id || s.id) === stdId)?.name  || null;
  const chapName = chapters.find(c  => (c._id || c.id) === chapId)?.name || null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-3">
        <Check ok={hasVideo}   label="Video" />
        <Check ok={hasContent} label="Content" />
        <Check ok={hasQuiz}    label="Quiz" />
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        <span className="rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 text-[10px] font-bold">
          STD: {stdName || stdId}
        </span>
        <span className="rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-bold">
          CH: {chapName || chapId}
        </span>
      </div>
    </div>
  );
}
