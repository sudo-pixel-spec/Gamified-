"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import {
  listStandards, createStandard, updateStandard, deleteStandard, restoreStandard, fetchAllAdminStandards,
  listSubjects, createSubject, updateSubject, deleteSubject, restoreSubject, fetchAllAdminSubjects,
  listUnits, createUnit, updateUnit, deleteUnit, restoreUnit, fetchAllAdminUnits,
  listChapters, createChapter, updateChapter, deleteChapter, restoreChapter, fetchAllAdminChapters,
  listLessons, createLesson, updateLesson, deleteLesson, restoreLesson, fetchAllAdminLessons,
  restoreQuiz,
} from "../../lib/admin-api";
import { apiFetch } from "../../lib/api";
import Link from "next/link";

// Shared Components
import DashboardStats from "./_components/DashboardStats";
import ManagementGrid from "./_components/ManagementGrid";
import EntityDrawer from "./_components/EntityDrawer";

/* ────────────────────────────── seed runner (kept for seed modal) ── */

function extractId(res) {
  return res?.data?._id ?? res?.data?.id ?? res?._id ?? res?.id ?? null;
}

/* ────────────────────────────── config ─────────────────────────── */

const AREA_FIELDS = {
  standards: [
    { key: "code", label: "Code", required: true, minLength: 3 },
    { key: "name", label: "Name", required: true },
    { key: "orderIndex", label: "Order Index", type: "number" },
  ],
  subjects: [
    { key: "name", label: "Name", required: true },
    { key: "standardId", label: "Standard ID", required: true },
    { key: "orderIndex", label: "Order Index", type: "number" },
  ],
  units: [
    { key: "name", label: "Name", required: true },
    { key: "subjectId", label: "Subject ID", required: true },
    { key: "orderIndex", label: "Order Index", type: "number" },
  ],
  chapters: [
    { key: "name", label: "Name", required: true },
    { key: "unitId", label: "Unit ID", required: true },
    { key: "orderIndex", label: "Order Index", type: "number" },
  ],
  lessons: [
    { key: "title", label: "Title", required: true },
    { key: "videoUrl", label: "Video URL" },
    { key: "contentText", label: "Markdown Content", type: "textarea" },
    { key: "bullets", label: "Resource Links (One per line)", type: "textarea" },
    { key: "chapterId", label: "Chapter ID", required: true },
    { key: "orderIndex", label: "Order Index", type: "number" },

  ],
};


const AREA_GROUPS = [
  {
    id: "curriculum",
    label: "Curriculum Systems",
    items: [
      { key: "standards", label: "Grades & Standards", icon: "verified",    list: listStandards, create: createStandard, update: updateStandard, remove: deleteStandard, restore: restoreStandard },
      { key: "subjects",  label: "Subject Logic",  icon: "menu_book",   list: listSubjects,  create: createSubject,  update: updateSubject,  remove: deleteSubject,  restore: restoreSubject },
      { key: "units",     label: "Unit Structure",  icon: "folder_open",  list: listUnits,     create: createUnit,     update: updateUnit,     remove: deleteUnit,     restore: restoreUnit },
      { key: "chapters",  label: "Chapter Flow",  icon: "auto_stories", list: listChapters,  create: createChapter,  update: updateChapter,  remove: deleteChapter,  restore: restoreChapter },
      { key: "lessons",   label: "Lesson Content",   icon: "co_present",   list: listLessons,   create: createLesson,   update: updateLesson,   remove: deleteLesson,   restore: restoreLesson },
    ]
  },
  {
    id: "governance",
    label: "Security & Staff",
    superOnly: true,
    items: [
      { key: "users",     label: "Admin Access",     icon: "admin_panel_settings" },
      { key: "audit",     label: "System Logs",     icon: "history" },
      { key: "system",     label: "Mission Control", icon: "security" },
    ]
  },
  {
    id: "operations",
    label: "Engagement",
    items: [
      { key: "notifications", label: "Broadcasts", icon: "notifications_active" },
      { key: "student-search", label: "User IQ Hub", icon: "badge", path: "/admin/users/search" },
      { key: "ui-preview",    label: "Mission Preview", icon: "preview", path: "/admin/system/preview" },
      { key: "ui-preview-users", label: "Users Preview", icon: "group_add", path: "/admin/users/preview" },
      { key: "ui-preview-jobs", label: "Jobs Preview", icon: "settings_remote", path: "/admin/jobs/preview" },
      { key: "events",        label: "Live Events", icon: "event_upcoming" },
      { key: "jobs",          label: "Worker Tasks", icon: "settings_suggest", superOnly: true },
    ]
  }
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


/* ────────────────────────────── page ───────────────────────────── */

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth(["admin"]);

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
  const [quizMap, setQuizMap] = useState({}); // { lessonId: boolean }

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
      const [stds, lessons] = await Promise.all([
        fetchAllAdminStandards(),
        fetchAllAdminLessons(),
      ]);
      if (cancelled) return;
      setCounts({
        standards: stds.length,
        lessons:   lessons.length,
      });
    })();
    return () => { cancelled = true; };
  }, [authLoading]);

  /* ── fetch all entities for cascading filters ── */
  useEffect(() => {
    if (authLoading) return;
    Promise.all([
      fetchAllAdminStandards(),
      fetchAllAdminSubjects(),
      fetchAllAdminUnits(),
      fetchAllAdminChapters(),
    ]).then(([stds, subs, units, chaps]) => {
      setAllStandards(stds);
      setAllSubjects(subs);
      setAllUnits(units);
      setAllChapters(chaps);
    });
  }, [authLoading]);

  /* ── load area items ── */
  const openArea = useCallback(async (area) => {
    if (area.key === "users") {
      router.push("/admin/users");
      return;
    }
    if (area.key === "audit") {
      router.push("/admin/audit");
      return;
    }
    if (area.key === "jobs") {
      router.push("/admin/jobs");
      return;
    }
    if (area.key === "notifications") {
      router.push("/admin/notifications");
      return;
    }
    if (area.key === "events") {
      router.push("/admin/events");
      return;
    }
    if (area.key === "system") {
      router.push("/admin/system");
      return;
    }
    if (area.key === "student-search" || area.key.startsWith("ui-preview")) {
      router.push(area.path);
      return;
    }
    if (!area.list) return;
    setActiveArea(area);
    setAreaLoading(true);
    setFilterStdId("");
    setFilterSubId("");
    setFilterUnitId("");
    setFilterChapterId("");
    setQuizMap({}); // Clear previous area quiz cache
    try {
      const res = await area.list();
      setItems(extract(res));
    } catch (err) {
      console.error("Area load failed:", err);
    } finally {
      setAreaLoading(false);
    }
  }, [router]);

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
          if (f.key === "bullets" && typeof val === "string") {
            payload[f.key] = val.split("\n").map(s => s.trim()).filter(s => s !== "");
          } else {
            payload[f.key] = f.type === "number" ? Number(val) : val;
          }
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
      if (err.message?.includes("500") || err.name === "TypeError") {
        setFormError("System Error: The ID you entered might be invalid or not found in the database. Please verify and try again.");
      } else {
        setFormError(err?.message || "Something went wrong");
      }
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

  /* ── Fetch quiz status for visible lessons ── */
  useEffect(() => {
    if (activeArea?.key !== "lessons" || filteredItems.length === 0) return;

    let cancelled = false;
    const lessonsToFetch = filteredItems.filter(l => quizMap[getItemId(l)] === undefined);
    
    if (lessonsToFetch.length === 0) return;

    (async () => {
      for (const lesson of lessonsToFetch) {
        if (cancelled) break;
        const id = getItemId(lesson);
        try {
          const res = await apiFetch(`/v1/admin/quizzes/latest?lessonId=${id}`);
          const quiz = res?.data ?? res;
          const hasQ = !!(quiz && (Array.isArray(quiz) ? quiz.length > 0 : (quiz._id || quiz.id)));
          if (!cancelled) {
            setQuizMap(prev => ({ ...prev, [id]: hasQ }));
          }
        } catch (e) {
          if (!cancelled) setQuizMap(prev => ({ ...prev, [id]: false }));
        }
      }
    })();

    return () => { cancelled = true; };
  }, [activeArea, filteredItems, quizMap]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-8 bg-[#0a0a0a] text-white">

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
            onClick={() => router.push("/dashboard")}
            className="flex size-10 items-center justify-center rounded-full bg-[#141414] border border-orange-500/20 hover:border-primary transition-colors"
          >
            <span className="material-symbols-outlined text-white/60">account_circle</span>
          </button>
        </div>

      </header>

      <main className="flex flex-col gap-6 p-4">

        <DashboardStats counts={counts} />





        <ManagementGrid 
          groups={AREA_GROUPS} 
          user={user} 
          onOpenArea={openArea} 
        />
      </main>

      {activeArea && (
        <EntityDrawer 
          activeArea={activeArea}
          showForm={showForm}
          editingItem={editingItem}
          formData={formData}
          formError={formError}
          formLoading={formLoading}
          areaLoading={areaLoading}
          items={items}
          filteredItems={filteredItems}
          allStandards={allStandards}
          allChapters={allChapters}
          quizMap={quizMap}
          filterStdId={filterStdId}
          filterSubId={filterSubId}
          filterUnitId={filterUnitId}
          filterChapterId={filterChapterId}
          subjectsForFilter={subjectsForFilter}
          unitsForFilter={unitsForFilter}
          chaptersForFilter={chaptersForFilter}
          onClose={closeArea}
          onCloseForm={closeForm}
          onOpenCreateForm={openCreateForm}
          onOpenEditForm={openEditForm}
          onFormSubmit={handleFormSubmit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onSetFormData={setFormData}
          onSetFilterStdId={setFilterStdId}
          onSetFilterSubId={setFilterSubId}
          onSetFilterUnitId={setFilterUnitId}
          onSetFilterChapterId={setFilterChapterId}
          onSetItems={setItems}
          onSetEditingItem={setEditingItem}
          router={router}
          AREA_FIELDS={AREA_FIELDS}
        />
      )}


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
