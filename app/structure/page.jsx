"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiFetch } from "../../lib/api";
import { listChapters, listLessons, listSubjects, listUnits } from "../../lib/admin-api";

function asArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;

  const directCandidates = [
    res?.data,
    res?.items,
    res?.results,
    res?.docs,
    res?.list,
    res,
  ];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  const nestedArrayCandidates = [
    res?.data?.items,
    res?.data?.results,
    res?.data?.docs,
    res?.data?.list,
    res?.data?.subjects,
    res?.data?.units,
    res?.data?.chapters,
    res?.data?.lessons,
  ];

  for (const candidate of nestedArrayCandidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function errorMessage(reason, fallback) {
  if (!reason) return fallback;
  if (reason instanceof Error) return reason.message || fallback;
  return String(reason);
}

function getId(item) {
  return item?._id ?? item?.id ?? null;
}

function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getRelatedId(item, relationKey) {
  const idField = item?.[`${relationKey}Id`];
  if (idField != null) {
    if (typeof idField === "object") return String(getId(idField) || "");
    return String(idField);
  }

  const relationField = item?.[relationKey];
  if (relationField == null) return "";
  if (typeof relationField === "object") return String(getId(relationField) || "");
  return String(relationField);
}

function getEntityKey(item, fallbackFields = []) {
  const id = getId(item);
  if (id != null) return String(id);

  for (const field of fallbackFields) {
    const value = item?.[field];
    if (value != null && String(value).trim()) return String(value);
  }

  return "";
}

function matchesStandard(subject, profile) {
  const profileStandard = profile?.standard;
  const profileStandardId = profile?.standardId;
  if (!profileStandard && !profileStandardId) return true;

  const subjectStandardId =
    subject?.standardId ?? subject?.standard?._id ?? subject?.standard?.id;
  const subjectStandardCode = subject?.standardCode ?? subject?.standard?.code;
  const subjectStandardName = subject?.standardName ?? subject?.standard?.name;

  return (
    (profileStandardId && subjectStandardId && String(profileStandardId) === String(subjectStandardId)) ||
    (profileStandard && subjectStandardCode && String(profileStandard).toLowerCase() === String(subjectStandardCode).toLowerCase()) ||
    (profileStandard && subjectStandardName && String(profileStandard).toLowerCase() === String(subjectStandardName).toLowerCase())
  );
}

function ContentStructureInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading: authLoading } = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const requestedSubjectId = searchParams.get("subjectId") || "";

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      const [meRes, subRes, unitRes, chapterRes, lessonRes] = await Promise.allSettled([
        apiFetch("/v1/me"),
        listSubjects(),
        listUnits(),
        listChapters(),
        listLessons(),
      ]);

      if (cancelled) return;

      const meData = meRes.status === "fulfilled" ? meRes.value?.data ?? meRes.value : null;
      const allSubjects = subRes.status === "fulfilled" ? asArray(subRes.value) : [];
      const allUnits = unitRes.status === "fulfilled" ? asArray(unitRes.value) : [];
      const allChapters = chapterRes.status === "fulfilled" ? asArray(chapterRes.value) : [];
      const allLessons = lessonRes.status === "fulfilled" ? asArray(lessonRes.value) : [];

      if (
        subRes.status === "rejected" ||
        unitRes.status === "rejected" ||
        chapterRes.status === "rejected" ||
        lessonRes.status === "rejected"
      ) {
        const details = [
          subRes.status === "rejected" ? `subjects: ${errorMessage(subRes.reason, "request failed")}` : null,
          unitRes.status === "rejected" ? `units: ${errorMessage(unitRes.reason, "request failed")}` : null,
          chapterRes.status === "rejected" ? `chapters: ${errorMessage(chapterRes.reason, "request failed")}` : null,
          lessonRes.status === "rejected" ? `lessons: ${errorMessage(lessonRes.reason, "request failed")}` : null,
        ]
          .filter(Boolean)
          .join(" | ");

        setError(`Some curriculum data failed to load. ${details}`);
      }

      setMe(meData);
      setSubjects(allSubjects);
      setUnits(allUnits);
      setChapters(allChapters);
      setLessons(allLessons);

      const profile = meData?.profile ?? {};
      const visibleSubjects = allSubjects.filter((s) => matchesStandard(s, profile));
      const initialSubject =
        visibleSubjects.find((s) => String(getId(s)) === requestedSubjectId) ||
        visibleSubjects[0] ||
        allSubjects.find((s) => String(getId(s)) === requestedSubjectId) ||
        allSubjects[0] ||
        null;

      const initialSubjectId = getEntityKey(initialSubject, ["code", "name", "title"]);
      setSelectedSubjectId(initialSubjectId);

      const unitsForSubject = allUnits
        .filter((u) => String(u?.subjectId ?? "") === initialSubjectId)
        .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
      const initialUnitId = getEntityKey(unitsForSubject[0], ["code", "name", "title", "order"]);
      setSelectedUnitId(initialUnitId);

      const chaptersForUnit = allChapters
        .filter((c) => String(c?.unitId ?? "") === initialUnitId)
        .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
      const initialChapterId = getEntityKey(chaptersForUnit[0], ["code", "name", "title", "order"]);
      setSelectedChapterId(initialChapterId);

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, requestedSubjectId]);

  const visibleSubjects = useMemo(() => {
    const profile = me?.profile ?? {};
    const filtered = subjects.filter((s) => matchesStandard(s, profile));
    return filtered.length > 0 ? filtered : subjects;
  }, [subjects, me]);

  const effectiveSelectedSubjectId = useMemo(() => {
    if (visibleSubjects.length === 0) return "";
    const hasSelected = visibleSubjects.some(
      (s) => getEntityKey(s, ["code", "name", "title"]) === String(selectedSubjectId)
    );
    if (hasSelected) return String(selectedSubjectId);
    return getEntityKey(visibleSubjects[0], ["code", "name", "title"]);
  }, [visibleSubjects, selectedSubjectId]);

  const selectedSubject =
    visibleSubjects.find(
      (s) => getEntityKey(s, ["code", "name", "title"]) === String(effectiveSelectedSubjectId)
    ) || visibleSubjects[0] || null;

  const unitsForSubject = useMemo(() => {
    const byId = units.filter(
      (u) => String(getRelatedId(u, "subject")) === String(effectiveSelectedSubjectId)
    );

    if (byId.length > 0) {
      return byId.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    }

    // Fallback when API returns text links rather than IDs.
    const subjectName = normalizeValue(selectedSubject?.name ?? selectedSubject?.title);
    const byName = units.filter((u) => {
      const unitSubjectName = normalizeValue(
        u?.subjectName ?? u?.subject?.name ?? u?.subject?.title
      );
      return subjectName && unitSubjectName === subjectName;
    });

    if (byName.length > 0) {
      return byName.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    }

    return [...units].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [units, effectiveSelectedSubjectId, selectedSubject]);

  const effectiveSelectedUnitId = useMemo(() => {
    if (unitsForSubject.length === 0) return "";
    const hasSelectedUnit = unitsForSubject.some(
      (u) => getEntityKey(u, ["code", "name", "title", "order"]) === String(selectedUnitId)
    );
    if (hasSelectedUnit) return String(selectedUnitId);
    return getEntityKey(unitsForSubject[0], ["code", "name", "title", "order"]);
  }, [unitsForSubject, selectedUnitId]);

  const chaptersForUnit = useMemo(() => {
    const byId = chapters
      .filter((c) => String(getRelatedId(c, "unit")) === String(effectiveSelectedUnitId))
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

    if (byId.length > 0) return byId;

    const selectedUnit = unitsForSubject.find(
      (u) => getEntityKey(u, ["code", "name", "title", "order"]) === String(effectiveSelectedUnitId)
    );
    const unitName = normalizeValue(selectedUnit?.name ?? selectedUnit?.title);

    return chapters
      .filter((c) => normalizeValue(c?.unitName ?? c?.unit?.name ?? c?.unit?.title) === unitName)
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [chapters, effectiveSelectedUnitId, unitsForSubject]);

  const effectiveChaptersForUnit = useMemo(() => {
    if (chaptersForUnit.length > 0) return chaptersForUnit;
    return [...chapters].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [chaptersForUnit, chapters]);

  const effectiveSelectedChapterId = useMemo(() => {
    if (effectiveChaptersForUnit.length === 0) return "";
    const hasSelectedChapter = effectiveChaptersForUnit.some(
      (c) => getEntityKey(c, ["code", "name", "title", "order"]) === String(selectedChapterId)
    );
    if (hasSelectedChapter) return String(selectedChapterId);
    return getEntityKey(effectiveChaptersForUnit[0], ["code", "name", "title", "order"]);
  }, [effectiveChaptersForUnit, selectedChapterId]);

  const lessonsForChapter = useMemo(() => {
    const byId = lessons
      .filter((l) => String(getRelatedId(l, "chapter")) === String(effectiveSelectedChapterId))
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

    if (byId.length > 0) return byId;

    const selectedChapter = effectiveChaptersForUnit.find(
      (c) => getEntityKey(c, ["code", "name", "title", "order"]) === String(effectiveSelectedChapterId)
    );
    const chapterName = normalizeValue(selectedChapter?.name ?? selectedChapter?.title);

    const byName = lessons
      .filter((l) => normalizeValue(l?.chapterName ?? l?.chapter?.name ?? l?.chapter?.title) === chapterName)
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

    if (byName.length > 0) return byName;

    return [...lessons].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [lessons, effectiveSelectedChapterId, effectiveChaptersForUnit]);

  const selectedUnit =
    unitsForSubject.find(
      (u) => getEntityKey(u, ["code", "name", "title", "order"]) === String(effectiveSelectedUnitId)
    ) || null;
  const selectedChapter =
    effectiveChaptersForUnit.find(
      (c) => getEntityKey(c, ["code", "name", "title", "order"]) === String(effectiveSelectedChapterId)
    ) || null;

  const learnerName = me?.profile?.fullName || "Learner";
  const learnerLevel = me?.level ?? 1;
  const totalXP = me?.totalXP ?? 0;
  const streak = me?.streakCount ?? 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-sm text-slate-500">Loading structure...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      <div className="flex min-h-screen overflow-hidden bg-stars bg-repeat">
        <aside className="w-80 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-card-dark/70 backdrop-blur-xl flex flex-col">
          <div className="p-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white">rocket_launch</span>
              </div>
              <span className="font-display font-bold text-xl tracking-wider text-primary">STELLAR</span>
            </button>

            <div className="space-y-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Current Subject</p>
                <select
                  value={effectiveSelectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedUnitId("");
                    setSelectedChapterId("");
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 px-3 py-2 text-sm"
                >
                  {visibleSubjects.length === 0 ? (
                    <option value="">No subjects</option>
                  ) : (
                    visibleSubjects.map((subject) => (
                      <option
                        key={getEntityKey(subject, ["code", "name", "title"]) || subject.name}
                        value={getEntityKey(subject, ["code", "name", "title"])}
                      >
                        {subject.name || subject.title || "Subject"}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Curriculum Units</p>
                {unitsForSubject.length === 0 ? (
                  <p className="text-xs text-slate-500">No units available for this subject.</p>
                ) : (
                  <ul className="space-y-2">
                    {unitsForSubject.map((unit) => {
                      const unitId = getEntityKey(unit, ["code", "name", "title", "order"]);
                      const active = unitId === String(effectiveSelectedUnitId);
                      const unitLabel = unit?.name || unit?.title || "Unit";

                      return (
                        <li key={unitId || unitLabel}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUnitId(unitId);
                              setSelectedChapterId("");
                            }}
                            className={`w-full flex items-center justify-between p-2.5 px-3 text-sm rounded-lg transition-colors ${
                              active
                                ? "text-primary bg-primary/10"
                                : "text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-primary/5"
                            }`}
                          >
                            <span className="flex items-center gap-2.5 font-medium">
                              <span className="material-symbols-outlined text-sm">{active ? "adjust" : "radio_button_checked"}</span>
                              {unitLabel}
                            </span>
                            <span className="material-symbols-outlined text-sm">{active ? "expand_more" : "chevron_right"}</span>
                          </button>

                          {active && (
                            <ul className="mt-1.5 ml-6 space-y-1 border-l border-primary/20">
                              {effectiveChaptersForUnit.length === 0 ? (
                                <li>
                                  <p className="block p-2 pl-4 text-xs text-slate-500">No chapters yet</p>
                                </li>
                              ) : (
                                effectiveChaptersForUnit.map((chapter) => {
                                  const chapterId = getEntityKey(chapter, ["code", "name", "title", "order"]);
                                  const chapterActive = chapterId === String(effectiveSelectedChapterId);
                                  return (
                                    <li key={chapterId || chapter.name}>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedChapterId(chapterId)}
                                        className={`w-full text-left block p-2 pl-4 text-xs rounded ${
                                          chapterActive
                                            ? "font-semibold text-primary border-l-2 border-primary -ml-[1px]"
                                            : "text-slate-500 dark:text-slate-400 hover:text-primary"
                                        }`}
                                      >
                                        {chapter?.name || chapter?.title || "Chapter"}
                                      </button>
                                    </li>
                                  );
                                })
                              )}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full border-2 border-primary/60 bg-primary/10 flex items-center justify-center text-primary font-bold">
                {learnerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold">{learnerName}</p>
                <p className="text-[10px] text-slate-500">Explorer Level {learnerLevel}</p>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, (totalXP % 500) / 5)}%` }} />
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-y-auto">
          <header className="h-20 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between bg-white/70 dark:bg-background-dark/20 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4 min-w-0">
              <h2 className="font-display text-lg tracking-wide uppercase truncate">{selectedSubject?.name || "Structure"}</h2>
              {selectedUnit && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">
                  {selectedUnit?.name || "Unit"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-primary text-xl">local_fire_department</span>
                <span className="font-bold text-sm">{streak} Days</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-yellow-500 text-xl">stars</span>
                <span className="font-bold text-sm">{totalXP.toLocaleString()} XP</span>
              </div>
            </div>
          </header>

          <div className="p-8 md:p-12 max-w-5xl mx-auto w-full">
            {error && (
              <div className="mb-6 rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
                {selectedChapter?.name || "No Chapter Selected"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                {selectedChapter?.description || "Select a chapter from the left panel to view its lessons."}
              </p>
            </div>

            {lessonsForChapter.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
                No lessons available for this chapter yet.
              </div>
            ) : (
              <div className="relative flex flex-col items-center py-6">
                <svg
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-full pointer-events-none opacity-20 dark:opacity-30"
                  viewBox="0 0 100 800"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M50 0 C 80 150, 20 250, 50 400 C 80 550, 20 650, 50 800"
                    stroke="url(#structureGradient)"
                    strokeWidth="4"
                    strokeDasharray="10 10"
                  />
                  <defs>
                    <linearGradient id="structureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF6B00" />
                      <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="flex flex-col gap-20 relative w-full items-center">
                  {lessonsForChapter.map((lesson, index) => {
                    const completed = Boolean(lesson?.completedAt || lesson?.isCompleted);
                    const active = !completed && index === 0;
                    const sideLeft = index % 2 === 0;
                    const lessonKey = getEntityKey(lesson, ["title", "name", "order"]);
                    const lessonTitle = lesson?.title || lesson?.name || `Lesson ${index + 1}`;
                    const lessonDescription = lesson?.description || "No description";
                    const moduleLabel = selectedUnit?.name || selectedSubject?.name || "Lesson Module";

                    const lessonHref = `/lesson?lessonId=${encodeURIComponent(lessonKey)}&title=${encodeURIComponent(lessonTitle)}&chapter=${encodeURIComponent(selectedChapter?.name || "Lesson Overview")}&module=${encodeURIComponent(moduleLabel)}&description=${encodeURIComponent(lessonDescription)}`;

                    return (
                      <button
                        key={String(getId(lesson) || `${lesson?.title}-${index}`)}
                        type="button"
                        onClick={() => router.push(lessonHref)}
                        className="relative flex flex-col items-center group"
                      >
                        <div
                          className={`w-20 h-20 rounded-full flex items-center justify-center z-10 transition-transform group-hover:scale-105 cursor-pointer ${
                            completed
                              ? "bg-primary text-white"
                              : active
                              ? "bg-background-dark border-4 border-primary text-primary animate-pulse"
                              : "bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600"
                          }`}
                        >
                          <span className="material-symbols-outlined text-3xl">
                            {completed ? "check" : active ? "rocket" : "lock"}
                          </span>
                        </div>

                        <div
                          className={`${sideLeft ? "-left-64 text-right" : "-right-64 text-left"} absolute top-0 w-56 h-full flex flex-col justify-center`}
                        >
                          <h3 className={`font-bold mb-1 ${completed || active ? "text-primary" : "text-slate-400"}`}>
                            {lessonTitle}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {lessonDescription}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ContentStructure() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>}>
      <ContentStructureInner />
    </Suspense>
  );
}
