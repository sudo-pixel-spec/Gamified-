"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiFetch } from "../../../lib/api";
import {
  fetchAllAdminStandards, fetchAllAdminSubjects, fetchAllAdminUnits, fetchAllAdminChapters, fetchAllAdminLessons
} from "../../../lib/admin-api";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CurriculumExplorerPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth(["admin", "super_admin"]);

  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deepExpandId, setDeepExpandId] = useState(null); // ID of the standard being deep-scanned

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const items = await fetchAllAdminStandards();
      setStandards(items || []);
    } catch (err) {
      console.error("Failed to load standards:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [authLoading, fetchData]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent shadow-[0_0_20px_rgba(255,107,0,0.2)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pb-32 selection:bg-orange-500/30">
      {/* Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/10 blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between mb-16 max-w-6xl mx-auto backdrop-blur-xl bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="size-12 flex items-center justify-center rounded-2xl border border-white/10 hover:bg-orange-500 hover:border-orange-400 hover:text-white transition-all text-white/40 shadow-xl">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 drop-shadow-sm">
              Explorer
            </h1>
            <p className="text-[10px] font-bold uppercase text-orange-500/60 tracking-[0.2em] mt-1">Directory Scan & Hierarchy</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">System Status</p>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase italic">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Synchronized
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="size-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:bg-orange-500 hover:text-white hover:border-orange-400 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined">dashboard</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto space-y-6">
        {standards.length === 0 ? (
          <div className="p-32 text-center border border-white/5 bg-white/[0.02] rounded-[4rem] backdrop-blur-3xl shadow-2xl">
            <span className="material-symbols-outlined text-8xl text-white/5 block mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">folder_off</span>
            <p className="text-white/20 font-black uppercase tracking-[0.5em] text-sm">Orbit Empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {standards.map(std => (
              <ExplorerItem
                key={std._id || std.id}
                item={std}
                type="standards"
                level={0}
                onDoubleClick={() => router.push(`/admin/standards/${std._id || std.id}`)}
                onDeepExpand={(id) => setDeepExpandId(id === deepExpandId ? null : id)}
                forceExpand={deepExpandId === (std._id || std.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ExplorerItem({ item, type, level, onDoubleClick, forceExpand = false, onDeepExpand }) {
  const [children, setChildren] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const id = item._id || item.id;
  const name = item.name || item.title || item.code || "Unnamed";

  const fetchChildren = useCallback(async (isExplicitExpand = true) => {
    if (loading) return;
    if (expanded && isExplicitExpand) {
      setExpanded(false);
      return;
    }

    setLoading(true);
    try {
      let items = [];
      if (type === "standards") {
        const all = await fetchAllAdminSubjects();
        items = all.filter(s => (s.standardId?._id || s.standardId?.id || s.standardId) === id);
      } else if (type === "subjects") {
        const all = await fetchAllAdminUnits();
        items = all.filter(u => (u.subjectId?._id || u.subjectId?.id || u.subjectId) === id);
      } else if (type === "units") {
        const all = await fetchAllAdminChapters();
        items = all.filter(c => (c.unitId?._id || c.unitId?.id || c.unitId) === id);
      } else if (type === "chapters") {
        const all = await fetchAllAdminLessons();
        items = all.filter(l => (l.chapterId?._id || l.chapterId?.id || l.chapterId) === id);
      }

      setChildren(items);
      setExpanded(true);
    } catch (err) {
      console.error("Expand error:", err);
    } finally {
      setLoading(false);
    }
  }, [id, type, expanded, loading]);

  // UseEffect for Deep Scan propagation
  useEffect(() => {
    if (forceExpand && !expanded && !loading) {
      fetchChildren(false);
    }
  }, [forceExpand, expanded, loading, fetchChildren]);

  const styles = {
    standards: "border-orange-500/30 bg-white/[0.03] text-orange-500 shadow-xl",
    subjects: "border-blue-500/30 bg-white/[0.03] text-blue-400 shadow-lg",
    units: "border-purple-500/30 bg-white/[0.03] text-purple-400 shadow-md",
    chapters: "border-emerald-500/30 bg-white/[0.03] text-emerald-400 shadow-sm",
    lessons: "border-white/10 bg-white/[0.03] text-white/40",
  };

  const nextType = {
    standards: "subjects",
    subjects: "units",
    units: "chapters",
    chapters: "lessons",
    lessons: null
  };

  const icon = {
    standards: "verified",
    subjects: "menu_book",
    units: "folder_open",
    chapters: "auto_stories",
    lessons: "play_circle"
  };

  return (
    <div className="w-full">
      <div
        onDoubleClick={onDoubleClick}
        className={`group flex items-center justify-between p-5 rounded-[2rem] border transition-all cursor-pointer select-none ${styles[type]} shadow-xl`}
      >
        <div className="flex items-center gap-5 flex-1 min-w-0">
          {nextType[type] && (
            <button
              onClick={(e) => { e.stopPropagation(); fetchChildren(); }}
              className={`flex items-center justify-center size-8 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500 hover:text-white transition-all ${expanded ? 'rotate-90 bg-orange-500 text-white' : ''}`}
            >
              <span className="material-symbols-outlined text-sm">{loading ? 'sync' : 'chevron_right'}</span>
            </button>
          )}
          <span className="material-symbols-outlined opacity-30 group-hover:opacity-100 transition-opacity text-2xl">{icon[type]}</span>
          <div className="min-w-0">
            <p className="font-bold text-white/90 group-hover:text-white transition-colors">{name}</p>
            {item.code && <p className="text-[10px] font-medium opacity-30 tracking-wider uppercase mt-0.5">{item.code}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {type === "standards" && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeepExpand(id); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all shadow-lg ${forceExpand ? 'bg-orange-600 border-orange-500 text-white animate-pulse' : 'bg-white/5 border-white/10 text-orange-500/60 hover:bg-orange-500 hover:text-white hover:border-orange-400'}`}
            >
              <span className="material-symbols-outlined text-sm">{forceExpand ? 'wifi_tethering' : 'view_in_ar'}</span>
              {forceExpand ? 'SCANNING...' : 'SCAN DIRECTORY'}
            </button>
          )}

          <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-all">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const pathMap = { standards: "standards", subjects: "subjects", units: "units", chapters: "chapters", lessons: "lesson" };
                router.push(`/admin/${pathMap[type]}/${id}`);
              }}
              className="size-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-orange-500 border border-white/10 text-white/40 hover:text-white transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
            <span className="material-symbols-outlined text-lg opacity-20 hidden md:block">drag_indicator</span>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {expanded && nextType[type] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-10 mt-3 space-y-3 border-l-2 border-white/5 pl-6 relative"
          >
            {/* Hierarchy Guide Line */}
            <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-orange-500/20 via-white/5 to-transparent" />

            {children.length === 0 ? (
              <div className="py-6 text-[10px] font-black text-white/10 uppercase tracking-[0.4em] pl-10 italic">
                Terminal Reach Reached
              </div>
            ) : (
              children.map(child => (
                <ExplorerItem
                  key={child._id || child.id}
                  item={child}
                  type={nextType[type]}
                  level={level + 1}
                  forceExpand={forceExpand}
                  onDeepExpand={onDeepExpand}
                  onDoubleClick={() => router.push(`/admin/${nextType[type]}/${child._id || child.id}`)}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

