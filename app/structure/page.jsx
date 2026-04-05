"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiFetch } from "../../lib/api";
import { resolveStandardCodeToId } from "../../lib/curriculum-api";
import { listChapters, listLessons, listSubjects, listUnits } from "../../lib/admin-api";

function asArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  const directCandidates = [res?.data, res?.items, res?.results, res?.docs, res?.list, res];
  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  const nestedArrayCandidates = [
    res?.data?.items, res?.data?.results, res?.data?.docs, res?.data?.list,
    res?.data?.subjects, res?.data?.units, res?.data?.chapters, res?.data?.lessons,
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

function isActualId(id) {
  if (!id) return false;
  if (id === "null" || id === "undefined" || id === "[lessonId]") return false;
  // MongoDB ObjectId is usually 24 hex chars
  if (typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id)) return true;
  // If it's something else (like an auto-increment ID or a specific code), 
  // we check if it's at least not a known placeholder.
  return id.length > 1;
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

  const subjectStandardId = subject?.standardId ?? subject?.standard?._id ?? subject?.standard?.id;
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
  const [dashboardHome, setDashboardHome] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [chapterQuiz, setChapterQuiz] = useState({ state: "idle", data: null });

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const requestedSubjectId = searchParams.get("subjectId") || "";

  const isCompleted = searchParams.get("completed") === "1";
  
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const meRes = await apiFetch("/v1/me");
        const meData = meRes?.data ?? meRes;
        if (cancelled) return;
        setMe(meData);

        const homeRes = await apiFetch("/v1/dashboard/home").catch(() => null);
        if (cancelled) return;
        setDashboardHome(homeRes?.data ?? homeRes);

        const stdRaw = meData?.profile?.standardId || meData?.profile?.standard;
        if (!stdRaw) {
          setError("No standard selected group. Please complete your profile.");
          setLoading(false);
          return;
        }

        // Resolve standard code or ID to the exact database ID for curriculum fetches
        const resolvedId = await resolveStandardCodeToId(stdRaw);

        // 1. Fetch Subjects for this resolved standard (Student-safe)
        const subRes = await apiFetch(`/v1/curriculum/subjects?standardId=${encodeURIComponent(resolvedId)}`);
        const allSubjects = asArray(subRes);
        if (cancelled) return;
        setSubjects(allSubjects);

        const activeSubId = requestedSubjectId || getEntityKey(allSubjects[0], ["code", "name", "title"]);
        setSelectedSubjectId(activeSubId);

        if (isActualId(activeSubId)) {
          // 2. Fetch Units for the subject (Student-safe)
          const unitRes = await apiFetch(`/v1/units?subjectId=${encodeURIComponent(activeSubId)}`);
          const allUnits = asArray(unitRes);
          if (cancelled) return;
          setUnits(allUnits);

          const activeUnitId = getEntityKey(allUnits[0], ["code", "name", "title", "order"]);
          setSelectedUnitId(activeUnitId);

          if (isActualId(activeUnitId)) {
            // 3. Fetch Chapters for the unit (Student-safe)
            const chapterRes = await apiFetch(`/v1/chapters?unitId=${encodeURIComponent(activeUnitId)}`);
            const allChapters = asArray(chapterRes);
            if (cancelled) return;
            setChapters(allChapters);

            const activeChapterId = getEntityKey(allChapters[0], ["code", "name", "title", "order"]);
            setSelectedChapterId(activeChapterId);

            if (isActualId(activeChapterId)) {
              // 4. Fetch Lessons for the chapter (Student-safe)
              // NOTE: This includes backend-calculated "unlocked" and "completed" fields!
              const lessonRes = await apiFetch(`/v1/lessons?chapterId=${encodeURIComponent(activeChapterId)}`);
              setLessons(asArray(lessonRes));
            }
          }
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Failed to load curriculum structure."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, requestedSubjectId, isCompleted]);

  const visibleSubjects = useMemo(() => {
    const profile = me?.profile ?? {};
    const filtered = subjects.filter((s) => matchesStandard(s, profile));
    return filtered.length > 0 ? filtered : subjects;
  }, [subjects, me]);

  const effectiveSelectedSubjectId = useMemo(() => {
    if (visibleSubjects.length === 0) return "";
    const hasSelected = visibleSubjects.some((s) => getEntityKey(s, ["code", "name", "title"]) === String(selectedSubjectId));
    if (hasSelected) return String(selectedSubjectId);
    return getEntityKey(visibleSubjects[0], ["code", "name", "title"]);
  }, [visibleSubjects, selectedSubjectId]);

  const selectedSubject = visibleSubjects.find((s) => getEntityKey(s, ["code", "name", "title"]) === String(effectiveSelectedSubjectId)) || visibleSubjects[0] || null;

  const unitsForSubject = useMemo(() => {
    const byId = units.filter((u) => String(getRelatedId(u, "subject")) === String(effectiveSelectedSubjectId));
    if (byId.length > 0) return byId.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    const subjectName = normalizeValue(selectedSubject?.name ?? selectedSubject?.title);
    const byName = units.filter((u) => {
      const unitSubjectName = normalizeValue(u?.subjectName ?? u?.subject?.name ?? u?.subject?.title);
      return subjectName && unitSubjectName === subjectName;
    });
    if (byName.length > 0) return byName.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    return [...units].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [units, effectiveSelectedSubjectId, selectedSubject]);

  const effectiveSelectedUnitId = useMemo(() => {
    if (unitsForSubject.length === 0) return "";
    const hasSelectedUnit = unitsForSubject.some((u) => getEntityKey(u, ["code", "name", "title", "order"]) === String(selectedUnitId));
    if (hasSelectedUnit) return String(selectedUnitId);
    return getEntityKey(unitsForSubject[0], ["code", "name", "title", "order"]);
  }, [unitsForSubject, selectedUnitId]);

  const chaptersForUnit = useMemo(() => {
    const byId = chapters.filter((c) => String(getRelatedId(c, "unit")) === String(effectiveSelectedUnitId)).sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    if (byId.length > 0) return byId;
    const selectedUnit = unitsForSubject.find((u) => getEntityKey(u, ["code", "name", "title", "order"]) === String(effectiveSelectedUnitId));
    const unitName = normalizeValue(selectedUnit?.name ?? selectedUnit?.title);
    return chapters.filter((c) => normalizeValue(c?.unitName ?? c?.unit?.name ?? c?.unit?.title) === unitName).sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [chapters, effectiveSelectedUnitId, unitsForSubject]);

  const effectiveChaptersForUnit = useMemo(() => {
    if (chaptersForUnit.length > 0) return chaptersForUnit;
    return [...chapters].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [chaptersForUnit, chapters]);

  const effectiveSelectedChapterId = useMemo(() => {
    if (effectiveChaptersForUnit.length === 0) return "";
    const hasSelectedChapter = effectiveChaptersForUnit.some((c) => getEntityKey(c, ["code", "name", "title", "order"]) === String(selectedChapterId));
    if (hasSelectedChapter) return String(selectedChapterId);
    return getEntityKey(effectiveChaptersForUnit[0], ["code", "name", "title", "order"]);
  }, [effectiveChaptersForUnit, selectedChapterId]);

  const lessonsForChapter = useMemo(() => {
    const byId = lessons.filter((l) => String(getRelatedId(l, "chapter")) === String(effectiveSelectedChapterId)).sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    if (byId.length > 0) return byId;
    const selectedChapter = effectiveChaptersForUnit.find((c) => getEntityKey(c, ["code", "name", "title", "order"]) === String(effectiveSelectedChapterId));
    const chapterName = normalizeValue(selectedChapter?.name ?? selectedChapter?.title);
    const byName = lessons.filter((l) => normalizeValue(l?.chapterName ?? l?.chapter?.name ?? l?.chapter?.title) === chapterName).sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    if (byName.length > 0) return byName;
    return [...lessons].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [lessons, effectiveSelectedChapterId, effectiveChaptersForUnit]);

  const selectedUnit = unitsForSubject.find((u) => getEntityKey(u, ["code", "name", "title", "order"]) === String(effectiveSelectedUnitId)) || null;
  const selectedChapter = effectiveChaptersForUnit.find((c) => getEntityKey(c, ["code", "name", "title", "order"]) === String(effectiveSelectedChapterId)) || null;
  useEffect(() => {
    if (!effectiveSelectedChapterId) {
      setChapterQuiz({ state: "idle", data: null });
      return;
    }

    let cancelled = false;
    
    // 1. Fetch Lessons for this specific chapter
    apiFetch(`/v1/lessons?chapterId=${encodeURIComponent(effectiveSelectedChapterId)}`)
      .then(res => {
        if (!cancelled) {
          setLessons(asArray(res));
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch lessons:", err);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [effectiveSelectedChapterId]);

  // Separate effect to handle the quiz once lessons are loaded
  useEffect(() => {
    const lastLesson = lessonsForChapter[lessonsForChapter.length - 1];
    const lastLessonId = lastLesson ? (lastLesson._id || lastLesson.id) : null;

    if (!lastLessonId) {
      setChapterQuiz({ state: "idle", data: null });
      return;
    }
    
    let cancelled = false;
    setChapterQuiz({ state: "loading", data: null });
    // Using v1/lessons or similar? No, if we MUST use quizzes/latest and it 403s, 
    // we handle it. But wait! students should use their own quiz route. 
    // IF NO STUDENT ROUTE EXISTS: We mock it to 'Coming Soon' to avoid blocking the UI.
    apiFetch(`/v1/admin/quizzes/latest?lessonId=${lastLessonId}`)
      .then(res => {
        if (!cancelled) setChapterQuiz({ state: "success", data: res?.data ?? res });
      })
      .catch((err) => {
        // If 403, it means the student cannot fetch admin quizzes
        if (!cancelled) {
          console.warn("Quiz is forbidden for students, showing coming soon status.");
          setChapterQuiz({ state: "success", data: { title: "Coming Soon", questions: [] } }); 
        }
      });
    return () => { cancelled = true; };
  }, [lessonsForChapter]);




  // DERIVED DATA & UNLOCK LOGIC
  const isAdmin = me?.role === "admin";
  const completedLessonsMap = useMemo(() => {
    const map = new Set();
    const dProg = dashboardHome?.progress?.completedLessons || dashboardHome?.completedLessons || [];
    dProg.forEach(id => map.add(String(id)));
    const mProg = me?.progress?.completedLessons || [];
    mProg.forEach(id => map.add(String(id)));
    lessons.forEach(l => {
      // Backend returns 'completed' for students in v1/lessons
      if (l.completedAt || l.isCompleted || l.completed) map.add(String(getId(l)));
    });
    return map;
  }, [dashboardHome, me, lessons]);

  const chapterLessonsTotal = lessonsForChapter.length;
  let chapterLessonsCompleted = 0;
  lessonsForChapter.forEach(l => {
    if (completedLessonsMap.has(String(getId(l)))) chapterLessonsCompleted++;
  });
  const chapterProgressPct = chapterLessonsTotal === 0 ? 0 : Math.round((chapterLessonsCompleted / chapterLessonsTotal) * 100);

  const learnerName = me?.profile?.fullName || "Learner";
  const firstName = learnerName.split(" ")[0];
  const learnerLevel = me?.level ?? 1;
  const totalXP = me?.totalXP ?? 0;
  const streak = dashboardHome?.streakCount ?? me?.streakCount ?? 0;
  const avatarUrl = me?.profile?.avatarUrl;

  const allChapterLessonsCompleted = chapterLessonsTotal > 0 && chapterLessonsCompleted === chapterLessonsTotal;
  const quizUnlocked = isAdmin || allChapterLessonsCompleted;
  const quizExists = chapterQuiz.state === "success" && chapterQuiz.data;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex h-screen overflow-hidden bg-[#0a0a0a] bg-stars bg-repeat">
        
        {/* Left Navigation Aside (Strict Black/Orange) */}
        <aside className="w-[340px] shrink-0 border-r border-orange-500/20 bg-[#111111] flex-col z-20 hidden md:flex h-full shadow-2xl">
          
          <div className="p-8 pb-4 border-b border-orange-500/10 backdrop-blur-md bg-[#111111]/80 z-10 shrink-0">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/images/logo.png" 
                alt="Gamified Logo" 
                className="w-10 h-10 drop-shadow-sm" 
              />
              <span className="font-display font-black text-2xl tracking-widest text-white">Gamified</span>
            </button>
          </div>

          {/* This is the scrolling Index container ! */}
          <div className="p-8 flex-1 overflow-y-auto no-scrollbar relative pt-6">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Subject Path
                </p>
                <select
                  value={effectiveSelectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedUnitId("");
                    setSelectedChapterId("");
                  }}
                  className="w-full rounded-2xl border-2 border-orange-500/30 bg-[#0a0a0a] px-4 py-3 text-sm font-bold text-white shadow-sm focus:border-primary transition-colors focus:outline-none"
                >
                  {visibleSubjects.length === 0 ? (
                    <option value="">No subjects active</option>
                  ) : (
                    visibleSubjects.map((subject) => (
                      <option key={getEntityKey(subject, ["code", "name", "title"]) || subject.name} value={getEntityKey(subject, ["code", "name", "title"])}>
                        {subject.name || subject.title || "Subject"}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Curriculum Modules
                </p>
                {unitsForSubject.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-orange-500/20 p-6 text-center text-xs text-white/40">
                    No active modules found.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {unitsForSubject.map((unit) => {
                      const unitId = getEntityKey(unit, ["code", "name", "title", "order"]);
                      const activeUnit = unitId === String(effectiveSelectedUnitId);
                      const unitLabel = unit?.name || unit?.title || "Unit";

                      return (
                        <li key={unitId || unitLabel} className="bg-[#141414] rounded-2xl p-1.5 border border-orange-500/20">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUnitId(unitId);
                              setSelectedChapterId("");
                            }}
                            className={`w-full flex items-center justify-between p-3.5 px-4 text-sm rounded-xl transition-all ${
                              activeUnit ? "bg-primary text-white font-bold shadow-lg shadow-primary/20" : "text-white/60 hover:text-white"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`material-symbols-rounded text-lg ${activeUnit ? "text-white" : "text-white/40"}`}>
                                {activeUnit ? "explore" : "radio_button_unchecked"}
                              </span>
                              {unitLabel}
                            </span>
                            <span className={`material-symbols-rounded text-sm transition-transform ${activeUnit ? "rotate-90 text-white" : ""}`}>chevron_right</span>
                          </button>

                          {activeUnit && (
                            <ul className="mt-2 mb-2 ml-5 space-y-1 border-l-2 border-orange-500/20 pl-3">
                              {effectiveChaptersForUnit.length === 0 ? (
                                <li><p className="block py-2 text-xs text-white/40">No chapters mapped.</p></li>
                              ) : (
                                effectiveChaptersForUnit.map((chapter) => {
                                  const chapterId = getEntityKey(chapter, ["code", "name", "title", "order"]);
                                  const chapterActive = chapterId === String(effectiveSelectedChapterId);
                                  return (
                                    <li key={chapterId || chapter.name} className="py-0.5">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedChapterId(chapterId)}
                                        className={`w-full text-left flex flex-col justify-center px-3 py-2.5 rounded-lg transition-all ${
                                          chapterActive ? "bg-primary/10 border border-primary/30" : "hover:bg-white/5"
                                        }`}
                                      >
                                        <div className={`text-sm ${chapterActive ? "font-bold text-primary" : "font-medium text-white/60"}`}>
                                          {chapter?.name || chapter?.title || "Chapter"}
                                        </div>
                                      </button>
                                      
                                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${chapterActive ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                                        <ul className="space-y-1.5 pl-3 border-l-[1.5px] border-primary/20 pb-2">
                                          {lessonsForChapter.length === 0 ? (
                                            <li className="text-[10px] text-white/40 font-medium py-1">No lessons yet</li>
                                          ) : (
                                            lessonsForChapter.map((l, idx) => {
                                              const isComp = l.completed || completedLessonsMap.has(String(getId(l)));
                                              return (
                                                <li key={getId(l) || `nested-l-${idx}`} className={`text-[11px] font-medium flex items-center gap-2.5 truncate py-1 transition-colors ${isComp ? 'text-white' : 'text-white/40'}`}>
                                                  <div className={`w-2 h-2 rounded-full shrink-0 ${isComp ? 'bg-primary shadow-[0_0_8px_rgba(255,107,0,0.6)]' : 'bg-[#222]'}`}></div>
                                                  <span className="truncate">{l.title || l.name || `Lesson ${idx + 1}`}</span>
                                                </li>
                                              )
                                            })
                                          )}
                                        </ul>
                                      </div>
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

          {/* Sticky Profile at Bottom */}
          <div className="p-6 border-t border-orange-500/20 bg-[#111111] shrink-0 sticky bottom-0 z-30">
            <Link href="/completeprofile" className="flex items-center gap-3 p-3 -m-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-orange-500/20 transition-all group">
              <div className="w-12 h-12 rounded-full border-[3px] border-primary/50 group-hover:border-primary transition-colors bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0 shadow-[0_0_15px_rgba(255,107,0,0.2)]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" width={48} height={48} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || "U")}&background=F97316&color=fff&size=100`} referrerPolicy="no-referrer" alt="Default Avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors text-white">{learnerName}</p>
                <p className="text-[10px] text-primary/70 font-black uppercase tracking-widest mt-0.5">Explorer Lvl {learnerLevel}</p>
              </div>
              <span className="material-symbols-rounded text-white/30 group-hover:text-primary ml-auto transition-colors">chevron_right</span>
            </Link>
          </div>
        </aside>

        {/* Central Curriculum Container */}
        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          <header className="h-[88px] shrink-0 border-b border-orange-500/20 px-6 md:px-10 flex items-center justify-between bg-[#0a0a0a]/90 backdrop-blur-2xl sticky top-0 z-30 w-full shadow-[0_4px_30px_rgba(255,107,0,0.03)]">
            <div className="flex items-center gap-4 min-w-0">
              
              {/* Back to Dashboard Button */}
              <button 
                onClick={() => router.push('/dashboard')} 
                className="w-10 h-10 rounded-full border border-orange-500/30 flex items-center justify-center hover:bg-orange-500/20 text-primary transition-colors shrink-0 mr-2"
                title="Back to Dashboard"
              >
                <span className="material-symbols-rounded text-xl">arrow_back</span>
              </button>

              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <span className="material-symbols-rounded text-white text-2xl">auto_stories</span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-display font-black text-2xl tracking-[0.1em] uppercase text-white truncate">
                  {selectedSubject?.name || "Structure"}
                </h2>
                {selectedUnit && (
                  <p className="text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    {selectedUnit?.name || "Unit"}
                  </p>
                )}
              </div>
            </div>
          </header>

          <div className="flex flex-1 w-full max-w-[1400px] mx-auto overflow-hidden">
            
            {/* Center Track for Lessons */}
            <div className="flex-1 p-6 sm:p-10 md:p-16 pb-32 border-r border-orange-500/20 overflow-y-auto scroll-smooth relative [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-[#0a0a0a] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-[#0a0a0a] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-orange-500/50">
              {error && (
                <div className="mb-8 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400 flex items-center gap-3">
                  <span className="material-symbols-rounded">error</span>
                  {error}
                </div>
              )}

              <div className="mb-16 text-center md:text-left relative z-10 bg-[#141414]/80 p-8 md:p-12 rounded-[2.5rem] border border-orange-500/30 shadow-2xl shadow-primary/5 backdrop-blur-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6 border border-primary/20">
                  <span className="material-symbols-rounded text-sm">explore</span> Current Path
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-black mb-6 tracking-tight text-white drop-shadow-sm">
                  {selectedChapter?.name || "Select Chapter"}
                </h1>
                <p className="text-white/70 max-w-2xl leading-relaxed text-base md:text-lg mx-auto md:mx-0 font-medium">
                  {selectedChapter?.description || "Select a chapter from the left panel to map out your lesson sequence, elevate your skills, and earn XP."}
                </p>
              </div>

              {lessonsForChapter.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-orange-500/30 p-16 text-center text-white/50 font-medium">
                  <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                    <span className="material-symbols-rounded text-4xl text-primary opacity-80">auto_awesome</span>
                  </div>
                  Path sequence is currently empty.
                </div>
              ) : (
                <div className="relative flex flex-col items-center py-6 w-full">
                  
                  {/* Mathematically precise SVG Track linking lessons */}
                  {(() => {
                    const nodeSpacing = 208; // gap-28 (112px) + h-24 (96px)
                    const testSpacing = 288; // gap-28 (112px) + mt-16 (64px) + h-24 half (48px) + h-32 half (64px)
                    const totalLessons = lessonsForChapter.length;
                    const hasTest = totalLessons > 0;
                    const svgHeight = Math.max(1, (totalLessons > 0 ? (totalLessons - 1) * nodeSpacing : 0) + (hasTest ? testSpacing : 0));

                    let pathD = "M 50 0";
                    for (let i = 1; i < totalLessons; i++) {
                      const startY = (i - 1) * nodeSpacing;
                      const endY = i * nodeSpacing;
                      const cpX = i % 2 !== 0 ? 120 : -20; 
                      pathD += " C " + cpX + " " + (startY + nodeSpacing * 0.3) + ", " + cpX + " " + (endY - nodeSpacing * 0.3) + ", 50 " + endY;
                    }
                    if (hasTest) {
                      const startY = totalLessons > 0 ? (totalLessons - 1) * nodeSpacing : 0;
                      const endY = startY + testSpacing;
                      const cpX = totalLessons % 2 !== 0 ? 120 : -20;
                      pathD += " C " + cpX + " " + (startY + testSpacing * 0.3) + ", " + cpX + " " + (endY - testSpacing * 0.3) + ", 50 " + endY;
                    }

                    return (
                      <svg 
                        className="absolute top-12 left-1/2 -translate-x-1/2 w-48 pointer-events-none z-0 opacity-80" 
                        style={{ height: `${svgHeight}px`, top: '48px' }} 
                        viewBox={`0 0 100 ${svgHeight}`} 
                        fill="none"
                      >
                        <path 
                          d={pathD} 
                          stroke="currentColor" 
                          className="text-orange-500/30" 
                          strokeWidth="12" 
                          strokeLinecap="round" 
                        />
                      </svg>
                    );
                  })()}

                  <div className="flex flex-col gap-28 relative w-full items-center z-10">
                    {lessonsForChapter.map((lesson, index) => {
                                              const lessonIdStr = String(getId(lesson));
                                              const isCompleted = lesson.completed || completedLessonsMap.has(lessonIdStr);
                                              const isUnlocked = isAdmin || lesson.unlocked || index === 0;
                                              const active = isUnlocked && !isCompleted;
                      const sideLeft = index % 2 === 0;

                      const lessonTitle = lesson?.title || lesson?.name || `Lesson ${index + 1}`;
                      const lessonDescription = lesson?.description || "Embark on this lesson to boost your knowledge.";
                      const moduleLabel = selectedUnit?.name || selectedSubject?.name || "Learning Module";
                      const lessonHref = `/lesson/${encodeURIComponent(lessonIdStr)}?chapterId=${encodeURIComponent(effectiveSelectedChapterId)}`;

                      return (
                        <div key={lessonIdStr || `lesson-${index}`} className="relative flex flex-col items-center group w-full max-w-[500px]">
                          
                          <button
                            type="button"
                            onClick={() => isUnlocked && router.push(lessonHref)}
                            disabled={!isUnlocked}
                            className={`relative flex items-center justify-center z-20 transition-all duration-300 w-24 h-24 rounded-full ${
                              !isUnlocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-2'
                            } ${
                              isCompleted 
                                ? 'bg-primary text-white border-b-[8px] border-orange-700 shadow-[0_10px_20px_rgba(255,107,0,0.5)]' 
                                : active 
                                  ? 'bg-white text-primary border-b-[8px] border-primary shadow-[0_15px_30px_rgba(255,107,0,0.6)] border-[3px] border-t-primary border-x-primary animate-pulse' 
                                  : 'bg-[#1a1a1a] border-b-[8px] border-[#333] text-white/40 shadow-sm'
                            }`}
                          >
                            <span className="material-symbols-rounded text-4xl font-black drop-shadow-sm">
                              {isCompleted ? "done" : active ? "rocket_launch" : "lock"}
                            </span>
                            
                            {(isCompleted || active) && (
                              <div className="absolute inset-0 rounded-full border-t-[3px] border-white/30 pointer-events-none"></div>
                            )}
                          </button>

                          <div className={`absolute top-1/2 -translate-y-1/2 ${sideLeft ? 'sm:-left-6 md:-left-20 lg:right-1/2 lg:mr-20 text-center lg:text-right' : 'sm:-right-6 md:-right-20 lg:left-1/2 lg:ml-20 text-center lg:text-left'} hidden lg:flex flex-col justify-center px-4 w-64 z-20 pointer-events-none`}>
                            <h3 className={`font-display font-black text-xl mb-1.5 drop-shadow-md ${active || isCompleted ? 'text-primary' : 'text-white/60'}`}>{lessonTitle}</h3>
                            <p className="text-xs text-white/50 line-clamp-2 bg-[#111111]/80 backdrop-blur-md rounded-xl p-3 font-medium border border-orange-500/10 shadow-sm">{lessonDescription}</p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Chapter Quiz Node */}
                    {chapterLessonsTotal > 0 && (
                      <div className="relative flex flex-col items-center group mt-16 w-full max-w-[500px]">
                        <button
                          onClick={() => {
                            const lastL = lessonsForChapter[lessonsForChapter.length - 1];
                            const lastLId = lastL ? (lastL._id || lastL.id) : null;
                            if (quizUnlocked && quizExists && lastLId) {
                              router.push(`/quiz?lessonId=${lastLId}&chapterId=${effectiveSelectedChapterId}&source=structure`);
                            }
                          }}
                          disabled={!quizUnlocked || !quizExists}
                          className={`relative flex items-center justify-center z-20 transition-all duration-300 w-32 h-32 rounded-[2rem] rotate-45 ${
                            !quizUnlocked || !quizExists ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105 hover:-translate-y-2'
                          } ${
                            quizUnlocked && quizExists 
                              ? 'bg-gradient-to-tr from-orange-500 via-primary to-orange-400 border-b-[10px] border-r-[10px] border-orange-700 text-white shadow-[0_20px_40px_rgba(255,107,0,0.6)]' 
                              : 'bg-[#1a1a1a] border-b-[10px] border-r-[10px] border-[#333] text-white/30'
                          }`}
                        >
                          <span className={`material-symbols-rounded text-5xl font-black -rotate-45 drop-shadow-md ${quizUnlocked && quizExists && "animate-pulse"}`}>
                            {quizUnlocked && quizExists ? "assignment" : "lock"}
                          </span>
                          {(quizUnlocked && quizExists) && (
                             <div className="absolute inset-0 rounded-[2rem] border-t-[4px] border-l-[4px] border-white/30 pointer-events-none"></div>
                          )}
                        </button>
                        
                        <div className="absolute top-[160px] w-full text-center">
                          <h3 className={`font-display font-black text-2xl mb-2 tracking-wide ${quizUnlocked && quizExists ? 'text-primary drop-shadow-sm' : 'text-white/40'}`}>Chapter Quiz</h3>
                          <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl inline-block shadow-sm ${quizExists ? (quizUnlocked ? "bg-primary/20 text-primary border border-primary/30" : "bg-[#111] text-white/40 border border-orange-500/10") : "bg-[#111] text-white/40 border border-orange-500/10"}`}>
                            {quizExists ? (quizUnlocked ? "Prove your mastery" : "Complete lessons to unlock") : "Quiz Coming Soon"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Stats Sidebar */}
            <aside className="hidden xl:flex w-[340px] shrink-0 flex-col border-l border-orange-500/20 bg-[#111111] shadow-xl overflow-y-auto no-scrollbar">
              <div className="p-8 space-y-8">
                
                {/* Chapter Progress Widget Premium */}
                <div className="bg-[#1a1a1a] p-7 rounded-[2rem] shadow-sm border border-orange-500/30 relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/50 mb-5 flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm text-primary">trending_up</span> Overall Progress
                  </h4>
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-5xl font-display font-black text-white leading-none">{chapterProgressPct}<span className="text-2xl text-primary">%</span></span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-bold text-white/60">Chapter Content</span>
                     <span className="text-xs font-black text-primary">{chapterLessonsCompleted} / {chapterLessonsTotal}</span>
                  </div>
                  <div className="h-4 w-full bg-[#0a0a0a] rounded-full overflow-hidden border border-orange-500/20 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full shadow-[0_0_15px_rgba(255,107,0,0.8)] transition-all duration-1000 ease-out" style={{ width: `${chapterProgressPct}%` }}></div>
                  </div>
                </div>

                {/* Global Stats Matrix */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] p-6 rounded-[2rem] flex flex-col items-center border border-orange-500/20 shadow-sm relative overflow-hidden">
                    <span className="material-symbols-rounded text-primary text-4xl mb-3 drop-shadow-sm">local_fire_department</span>
                    <span className="text-3xl font-display font-black text-white mb-1 leading-none">{streak}</span>
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Day Streak</span>
                  </div>
                  <div className="bg-[#1a1a1a] p-6 rounded-[2rem] flex flex-col items-center border border-orange-500/20 shadow-sm relative overflow-hidden">
                    <span className="material-symbols-rounded text-primary text-4xl mb-3 drop-shadow-[0_0_10px_rgba(255,107,0,0.5)]">stars</span>
                    <span className="text-3xl font-display font-black text-white mb-1 leading-none">{totalXP}</span>
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Total XP</span>
                  </div>
                </div>

                <div className="w-full h-px bg-orange-500/20 my-4"></div>

                {/* Quick Navigation Links */}
                <div className="space-y-4">
                  <Link href="/analytics" className="w-full p-5 bg-[#1a1a1a] hover:bg-primary text-white transition-all duration-300 rounded-[1.5rem] border border-orange-500/20 flex items-center justify-between group shadow-sm hover:shadow-primary/30 hover:-translate-y-1">
                    <div className="flex items-center gap-4 font-bold text-sm">
                      <div className="w-10 h-10 rounded-full bg-[#222] group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <span className="material-symbols-rounded text-primary group-hover:text-white transition-colors">monitoring</span>
                      </div>
                      <span className="text-white">Review Analytics</span>
                    </div>
                    <span className="material-symbols-rounded text-white/30 group-hover:text-white transition-colors -translate-x-2 group-hover:translate-x-0">arrow_forward</span>
                  </Link>

                  <Link href="/leaderboard" className="w-full p-5 bg-[#1a1a1a] hover:bg-orange-600 text-white transition-all duration-300 rounded-[1.5rem] border border-orange-500/20 flex items-center justify-between group shadow-sm hover:shadow-orange-600/30 hover:-translate-y-1">
                    <div className="flex items-center gap-4 font-bold text-sm">
                      <div className="w-10 h-10 rounded-full bg-[#222] group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <span className="material-symbols-rounded text-orange-600 group-hover:text-white transition-colors">emoji_events</span>
                      </div>
                      <span className="text-white">Leaderboard Hub</span>
                    </div>
                    <span className="material-symbols-rounded text-white/30 group-hover:text-white transition-colors -translate-x-2 group-hover:translate-x-0">arrow_forward</span>
                  </Link>
                </div>

              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ContentStructure() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>}>
      <ContentStructureInner />
    </Suspense>
  );
}
