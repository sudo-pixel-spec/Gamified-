"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import {
  listStandards, createStandard, updateStandard, deleteStandard, restoreStandard,
  listSubjects, createSubject, updateSubject, deleteSubject, restoreSubject,
  listUnits, createUnit, updateUnit, deleteUnit, restoreUnit,
  listChapters, createChapter, updateChapter, deleteChapter, restoreChapter,
  listLessons, createLesson, updateLesson, deleteLesson, restoreLesson,
  restoreQuiz,
} from "../../lib/admin-api";
import { apiFetch } from "../../lib/api";
import LessonVideoPanel from "../../components/LessonVideoPanel";
import Link from "next/link";

/* ────────────────────────────── seed runner (kept for seed modal) ── */

function extractId(res) {
  return res?.data?._id ?? res?.data?.id ?? res?._id ?? res?.id ?? null;
}

/* ────────────────────────────── config ─────────────────────────── */

const AREA_FIELDS = {
  standards: [
    { key: "code", label: "Code", required: true, minLength: 3 },
    { key: "name", label: "Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "order", label: "Order", type: "number" },
  ],
  subjects: [
    { key: "name", label: "Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "standardId", label: "Standard ID", required: true },
    { key: "order", label: "Order", type: "number" },
  ],
  units: [
    { key: "name", label: "Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "subjectId", label: "Subject ID", required: true },
    { key: "order", label: "Order", type: "number" },
  ],
  chapters: [
    { key: "name", label: "Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "unitId", label: "Unit ID", required: true },
    { key: "order", label: "Order", type: "number" },
  ],
  lessons: [
    { key: "title", label: "Title", required: true },
    { key: "videoUrl", label: "Video URL" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "content", label: "Content (Markdown)", type: "textarea" },
    { key: "standardId", label: "Standard ID" },
    { key: "chapterId", label: "Chapter ID", required: true },
    { key: "xp", label: "XP Value", type: "number" },
    { key: "order", label: "Order", type: "number" },
  ],
};

const AREAS = [
  { key: "standards", label: "Standards", icon: "verified",    list: listStandards, create: createStandard, update: updateStandard, remove: deleteStandard, restore: restoreStandard },
  { key: "subjects",  label: "Subjects",  icon: "menu_book",   list: listSubjects,  create: createSubject,  update: updateSubject,  remove: deleteSubject,  restore: restoreSubject },
  { key: "units",     label: "Units",     icon: "folder_open",  list: listUnits,     create: createUnit,     update: updateUnit,     remove: deleteUnit,     restore: restoreUnit },
  { key: "chapters",  label: "Chapters",  icon: "auto_stories", list: listChapters,  create: createChapter,  update: updateChapter,  remove: deleteChapter,  restore: restoreChapter },
  { key: "lessons",   label: "Lessons",   icon: "co_present",   list: listLessons,   create: createLesson,   update: updateLesson,   remove: deleteLesson,   restore: restoreLesson },
  { key: "quizzes",   label: "Quizzes",   icon: "quiz",         restore: restoreQuiz },
];

/* ────────────────────────────── helpers ────────────────────────── */

function extract(res) {
  if (!res) return [];
  const d = res?.data?.items ?? res?.data ?? res?.items ?? res;
  return Array.isArray(d) ? d : [];
}

function getItemId(item) {
  return item?._id ?? item?.id ?? null;
}

function hasValue(value) {
  return value != null && String(value).trim() !== "";
}

function getPreviewText(value, maxLength = 220) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/* ────────────── Lesson Status Checklist ────────────────────────── */

function LessonChecklist({ lesson, standards, chapters }) {
  const hasVideo   = !!(lesson.videoUrl && lesson.videoUrl.trim());
  const hasContent = !!(lesson.contentText || lesson.content || lesson.description);
  const hasQuiz    = !!(lesson.hasQuiz || (lesson.quizCount != null && lesson.quizCount > 0));

  const stdId  = lesson.standardId  || lesson.standard?.id  || lesson.standard?._id  || "—";
  const chapId = lesson.chapterId   || lesson.chapter?.id   || lesson.chapter?._id   || "—";

  const stdName  = standards.find(s => (s._id || s.id) === stdId)?.name  || null;
  const chapName = chapters.find(c  => (c._id || c.id) === chapId)?.name || null;

  const Check = ({ ok, label }) => (
    <span className={`flex items-center gap-1 text-[11px] font-medium ${ok ? "text-emerald-400" : "text-rose-400"}`}>
      <span className="material-symbols-outlined text-[14px]">{ok ? "check_circle" : "cancel"}</span>
      {label}
    </span>
  );

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

/* ────────────────────────────── page ───────────────────────────── */

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth(["admin", "super_admin"]);

  const [counts, setCounts] = useState({ standards: 0, lessons: 0, quizzes: 0 });
  const [activeArea, setActiveArea] = useState(null);
  const [items, setItems] = useState([]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [tab, setTab] = useState("home");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Cascading filters data
  const [allStandards, setAllStandards] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [allChapters, setAllChapters] = useState([]);

  // Filters state
  const [filterStdId, setFilterStdId] = useState("");
  const [filterSubId, setFilterSubId] = useState("");
  const [filterUnitId, setFilterUnitId] = useState("");
  const [filterChapterId, setFilterChapterId] = useState("");

  /* ── summary data ── */
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      const [stdsRes, lessonsRes] = await Promise.allSettled([
        listStandards(),
        listLessons(),
      ]);
      if (cancelled) return;
      setCounts({
        standards: extract(stdsRes.status === "fulfilled" ? stdsRes.value : null).length,
        lessons:   extract(lessonsRes.status === "fulfilled" ? lessonsRes.value : null).length,
        quizzes: 0,
      });
    })();
    return () => { cancelled = true; };
  }, [authLoading]);

  /* ── fetch all entities for cascading filters ── */
  useEffect(() => {
    if (authLoading) return;
    Promise.allSettled([
      apiFetch("/v1/curriculum/standards"),
      apiFetch("/v1/admin/subjects?limit=500"),
      apiFetch("/v1/admin/units?limit=500"),
      apiFetch("/v1/admin/chapters?limit=500"),
    ]).then(([stdsRes, subsRes, unitsRes, chapsRes]) => {
      if (stdsRes.status === "fulfilled") setAllStandards(extract(stdsRes.value));
      if (subsRes.status === "fulfilled") setAllSubjects(extract(subsRes.value));
      if (unitsRes.status === "fulfilled") setAllUnits(extract(unitsRes.value));
      if (chapsRes.status === "fulfilled") setAllChapters(extract(chapsRes.value));
    });
  }, [authLoading]);

  /* ── load area items ── */
  const openArea = useCallback(async (area) => {
    if (!area.list) return;
    setActiveArea(area);
    setAreaLoading(true);
    setFilterStdId("");
    setFilterSubId("");
    setFilterUnitId("");
    setFilterChapterId("");
    const res = await area.list();
    setItems(extract(res));
    setAreaLoading(false);
  }, []);

  const closeArea = () => {
    setActiveArea(null);
    setItems([]);
    setShowForm(false);
    setEditingItem(null);
  };

  /* ── form helpers ── */
  const openCreateForm = () => { setEditingItem(null); setFormData({}); setFormError(""); setShowForm(true); };
  const openEditForm = (item) => { setEditingItem(item); setFormData({ ...item }); setFormError(""); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingItem(null); setFormData({}); setFormError(""); };

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!activeArea) return;
    setFormLoading(true);
    setFormError("");
    try {
      const fields = AREA_FIELDS[activeArea.key] || [];
      const payload = {};
      for (const f of fields) {
        const val = formData[f.key];
        if (val !== undefined && val !== "") {
          payload[f.key] = f.type === "number" ? Number(val) : val;
        }
      }
      delete payload.jobStatus;

      if (editingItem) {
        await activeArea.update(editingItem._id || editingItem.id, payload);
      } else {
        await activeArea.create(payload);
      }
      const res = await activeArea.list();
      setItems(extract(res));
      closeForm();
    } catch (err) {
      setFormError(err?.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  }, [activeArea, formData, editingItem]);

  /* ── CRUD handlers ── */
  const handleDelete = useCallback(async (area, id) => {
    if (!area.remove) return;
    await area.remove(id);
    const res = await area.list();
    setItems(extract(res));
  }, []);

  const handleRestore = useCallback(async (area, id) => {
    if (!area.restore) return;
    await area.restore(id);
    if (area.list) {
      const res = await area.list();
      setItems(extract(res));
    }
  }, []);

  /* ── filtered lessons with hierarchical tracing ── */
  const filteredItems = useMemo(() => {
    if (activeArea?.key !== "lessons") return items;

    // To improve performance, we can build maps
    const chapterMap = new Map(allChapters.map(c => [c._id || c.id, c]));
    const unitMap    = new Map(allUnits.map(u => [u._id || u.id, u]));
    const subjectMap = new Map(allSubjects.map(s => [s._id || s.id, s]));

    return items.filter(lesson => {
      const lessonChapId = lesson.chapterId || lesson.chapter?._id || lesson.chapter?.id;
      if (!lessonChapId) return false;

      const chapter = chapterMap.get(lessonChapId);
      if (!chapter) return false; // Lesson has orphan chapter or not yet loaded

      const lessonUnitId = chapter.unitId || chapter.unit?._id || chapter.unit?.id;
      const unit = unitMap.get(lessonUnitId);
      const lessonSubId = unit?.subjectId || unit?.subject?._id || unit?.subject?.id;
      const subject = subjectMap.get(lessonSubId);
      const lessonStdId = subject?.standardId || subject?.standard?._id || subject?.standard?.id || lesson.standardId;

      // Cascading logic
      if (filterStdId && lessonStdId !== filterStdId) return false;
      if (filterSubId && lessonSubId !== filterSubId) return false;
      if (filterUnitId && lessonUnitId !== filterUnitId) return false;
      if (filterChapterId && lessonChapId !== filterChapterId) return false;

      return true;
    });
  }, [items, activeArea, allChapters, allUnits, allSubjects, filterStdId, filterSubId, filterUnitId, filterChapterId]);

  // Derived filter options
  const subjectsForFilter = useMemo(() => {
    return filterStdId ? allSubjects.filter(s => (s.standardId || s.standard?._id || s.standard?.id) === filterStdId) : allSubjects;
  }, [allSubjects, filterStdId]);

  const unitsForFilter = useMemo(() => {
    return filterSubId ? allUnits.filter(u => (u.subjectId || u.subject?._id || u.subject?.id) === filterSubId) : allUnits;
  }, [allUnits, filterSubId]);

  const chaptersForFilter = useMemo(() => {
    return filterUnitId ? allChapters.filter(c => (c.unitId || c.unit?._id || c.unit?.id) === filterUnitId) : allChapters;
  }, [allChapters, filterUnitId]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-[#0a0a0a] text-white">

      {/* ══════ Header ══════ */}
      <header className="flex items-center justify-between p-4 sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-orange-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <span className="material-symbols-outlined">dashboard_customize</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-lg hover:bg-emerald-500/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Student View
          </button>
          <button
            onClick={() => router.push("/admin/seed")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-sm font-bold rounded-lg hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            Seed
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex size-10 items-center justify-center rounded-full bg-[#141414] border border-orange-500/20 hover:border-primary transition-colors"
          >
            <span className="material-symbols-outlined text-white/60">account_circle</span>
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-6 p-4">

        {/* ══════ Stats ══════ */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard label="Total Standards" value={counts.standards} up />
          <StatCard label="Active Lessons"  value={counts.lessons} up />
          <StatCard label="Pending Quizzes" value={counts.quizzes} className="col-span-2 md:col-span-1" />
        </section>

        {/* ══════ Seed Link Banner (replaces Seed Data Preview) ══════ */}
        <section className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold text-sm text-white">Seed Curriculum Data</p>
            <p className="text-xs text-white/50 mt-0.5">
              Use the dedicated seed page to insert the complete CBSE Grade VIII Data Science handbook.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/seed")}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Open Seed Page
          </button>
        </section>

        {/* ══════ Management Areas ══════ */}
        <section>
          <h2 className="text-lg font-bold mb-4 px-1">Management Areas</h2>
          <div className="grid grid-cols-2 gap-3">
            {AREAS.map((area) => (
              <button
                key={area.key}
                onClick={() => openArea(area)}
                className="flex flex-col items-start gap-3 rounded-xl border border-orange-500/10 bg-[#141414] p-5 hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95 group text-left"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">{area.icon}</span>
                </div>
                <span className="font-bold text-white">{area.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* ══════ Area Detail Drawer ══════ */}
      {activeArea && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]">
          <header className="flex items-center justify-between p-4 border-b border-orange-500/20 bg-[#0a0a0a]/95 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button onClick={showForm ? closeForm : closeArea} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-white">arrow_back</span>
              </button>
              <h2 className="text-lg font-bold text-white">
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
                Create New
              </button>
            )}
          </header>

          {/* ── Lesson Cascading Filters ── */}
          {!showForm && activeArea.key === "lessons" && (
            <div className="px-4 py-3 border-b border-orange-500/10 flex flex-wrap gap-3 bg-[#0f0f0f]">
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/50 font-medium shrink-0">Grade</label>
                <select
                  value={filterStdId}
                  onChange={e => { setFilterStdId(e.target.value); setFilterSubId(""); setFilterUnitId(""); setFilterChapterId(""); }}
                  className="bg-[#1a1a1a] border border-orange-500/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
                >
                  <option value="">All</option>
                  {allStandards.map(s => (
                    <option key={s._id || s.id} value={s._id || s.id}>{s.code}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/50 font-medium shrink-0">Subject</label>
                <select
                  value={filterSubId}
                  onChange={e => { setFilterSubId(e.target.value); setFilterUnitId(""); setFilterChapterId(""); }}
                  className="bg-[#1a1a1a] border border-orange-500/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary max-w-[120px]"
                >
                  <option value="">All</option>
                  {subjectsForFilter.map(s => (
                    <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/50 font-medium shrink-0">Unit</label>
                <select
                  value={filterUnitId}
                  onChange={e => { setFilterUnitId(e.target.value); setFilterChapterId(""); }}
                  className="bg-[#1a1a1a] border border-orange-500/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary max-w-[100px]"
                >
                  <option value="">All</option>
                  {unitsForFilter.map(u => (
                    <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/50 font-medium shrink-0">Chapter</label>
                <select
                  value={filterChapterId}
                  onChange={e => setFilterChapterId(e.target.value)}
                  className="bg-[#1a1a1a] border border-orange-500/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary max-w-[120px]"
                >
                  <option value="">All</option>
                  {chaptersForFilter.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <span className="text-[11px] text-white/30 self-center font-bold uppercase tracking-widest">
                {filteredItems.length} Lessons Found
              </span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {showForm ? (
              <div className="max-w-lg mx-auto space-y-8">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">{formError}</div>
                  )}
                  {(AREA_FIELDS[activeArea.key] || []).map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium mb-1.5 text-white/80">
                        {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          className="w-full px-3 py-2 bg-[#141414] border border-orange-500/20 rounded-xl focus:outline-none focus:border-primary transition text-sm min-h-[100px] resize-y text-white"
                          value={formData[field.key] || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          required={field.required}
                          placeholder={field.label}
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          className="w-full px-3 py-2 bg-[#141414] border border-orange-500/20 rounded-xl focus:outline-none focus:border-primary transition text-sm text-white"
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

                {/* Video Panel only in form */}
                {activeArea.key === "lessons" && editingItem && !editingItem.deletedAt && (
                   <div className="pt-8 border-t border-orange-500/20">
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary">play_circle</span>
                       Manage Lesson Video
                     </h3>
                     <LessonVideoPanel
                       lessonId={getItemId(editingItem)}
                       lessonTitle={editingItem.title}
                       lessonContent={editingItem.contentText ?? editingItem.content ?? ""}
                       currentVideoUrl={editingItem.videoUrl ?? ""}
                       onSaved={(url) => {
                         setItems(prev => prev.map(i => getItemId(i) === getItemId(editingItem) ? { ...i, videoUrl: url } : i));
                         setEditingItem(prev => ({ ...prev, videoUrl: url }));
                       }}
                     />
                   </div>
                )}
              </div>
            ) : areaLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-white/20">inbox</span>
                <p className="text-white/40 mt-2">No {activeArea.label.toLowerCase()} found matching your filters</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredItems.map((item) => {
                  const itemId = getItemId(item);
                  const detailFields = (AREA_FIELDS[activeArea.key] || []).filter(field => hasValue(item[field.key]));
                  const metaFields = detailFields.filter(f => !["description", "content", "videoUrl"].includes(f.key));
                  const textFields = detailFields.filter(f => ["description", "content"].includes(f.key));

                  return (
                    <div
                      key={itemId}
                      className="rounded-xl border border-orange-500/10 bg-[#141414] p-4 hover:border-orange-500/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold break-words text-white">
                              {item.name || item.title || item.label || itemId}
                            </p>
                            {activeArea.key === "lessons" && (
                              <Link
                                href={`/lesson/${itemId}`}
                                className="inline-flex items-center gap-1 text-[10px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase font-bold hover:bg-primary hover:text-white transition-colors"
                              >
                                View Page
                                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                              </Link>
                            )}
                          </div>
                          {item.deletedAt && <span className="text-[10px] text-rose-400 font-medium">Deleted</span>}
                          {itemId && (
                            <p className="text-[11px] text-white/30 mt-1 break-all font-mono">ID: {itemId}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {activeArea.update && AREA_FIELDS[activeArea.key] && !item.deletedAt && (
                            <button
                              onClick={() => openEditForm(item)}
                              className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          )}
                          {item.deletedAt && activeArea.restore ? (
                            <button
                              onClick={() => handleRestore(activeArea, itemId)}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title="Restore"
                            >
                              <span className="material-symbols-outlined text-[20px]">restore</span>
                            </button>
                          ) : (
                            activeArea.remove && (
                              <button
                                onClick={() => handleDelete(activeArea, itemId)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {metaFields.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {metaFields.map((field) => (
                            <span
                              key={field.key}
                              className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-white/60"
                            >
                              {field.label}: {String(item[field.key])}
                            </span>
                          ))}
                        </div>
                      )}

                      {textFields.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {textFields.map((field) => (
                            <div key={field.key} className="rounded-lg border border-white/5 bg-[#111] p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{field.label}</p>
                              <p className="text-sm text-white/60 whitespace-pre-wrap break-words line-clamp-4">
                                {getPreviewText(item[field.key], field.key === "content" ? 320 : 220)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeArea.key === "lessons" && !item.deletedAt && (
                        <LessonChecklist lesson={item} standards={allStandards} chapters={allChapters} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════ Bottom Nav ══════ */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-orange-500/20 bg-[#0a0a0a]/90 backdrop-blur-lg px-4 pb-6 pt-2 z-40">
        <div className="mx-auto flex max-w-md gap-2">
          {[
            { key: "home", icon: "home", label: "Home" },
            { key: "search", icon: "search", label: "Search" },
            { key: "settings", icon: "settings", label: "Settings" },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors ${tab === key ? "text-primary" : "text-white/40 hover:text-primary"}`}
            >
              <span className="material-symbols-outlined" style={tab === key ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
              <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ────────────────────────────── StatCard ───────────────────────── */

function StatCard({ label, value, up, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl p-4 bg-[#141414] border border-orange-500/10 shadow-sm ${className}`}>
      <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-white">{value}</p>
        {up != null && (
          <span className={`text-xs font-bold flex items-center mb-1 ${up ? "text-emerald-400" : "text-rose-400"}`}>
            <span className="material-symbols-outlined text-sm">{up ? "trending_up" : "trending_down"}</span>
          </span>
        )}
      </div>
    </div>
  );
}
