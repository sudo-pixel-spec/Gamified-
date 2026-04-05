"use client";

import React from "react";
import Link from "next/link";
import LessonVideoPanel from "../../../components/LessonVideoPanel";
import LessonChecklist from "./LessonChecklist";

export default function EntityDrawer({
  activeArea,
  showForm,
  editingItem,
  formData,
  formError,
  formLoading,
  areaLoading,
  items,
  filteredItems,
  allStandards,
  allChapters,
  quizMap,
  filterStdId,
  filterSubId,
  filterUnitId,
  filterChapterId,
  subjectsForFilter,
  unitsForFilter,
  chaptersForFilter,
  onClose,
  onCloseForm,
  onOpenCreateForm,
  onOpenEditForm,
  onFormSubmit,
  onDelete,
  onRestore,
  onSetFormData,
  onSetFilterStdId,
  onSetFilterSubId,
  onSetFilterUnitId,
  onSetFilterChapterId,
  onSetItems,
  onSetEditingItem,
  router,
  AREA_FIELDS
}) {
  const getItemId = (item) => item?._id ?? item?.id ?? null;
  const hasValue = (value) => value != null && String(value).trim() !== "";
  const getPreviewText = (value, maxLength = 220) => {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]">
      <header className="flex items-center justify-between p-4 border-b border-orange-500/20 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={showForm ? onCloseForm : onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold text-white">
            {showForm
              ? (editingItem ? "Edit" : "Create") + " " + activeArea.label.replace(/s$/, "")
              : activeArea.label}
          </h2>
        </div>
        {!showForm && activeArea.create && AREA_FIELDS[activeArea.key] && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push("/admin/explorer")}
              className="p-1.5 rounded-lg border border-orange-500/20 text-orange-500 hover:bg-orange-500/10 transition-colors"
              title="Open in Tree View"
            >
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </button>
            <button
              onClick={onOpenCreateForm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create New
            </button>
          </div>
        )}
      </header>

      {/* ── Lesson Cascading Filters ── */}
      {!showForm && activeArea.key === "lessons" && (
        <div className="px-4 py-3 border-b border-orange-500/10 flex flex-wrap gap-3 bg-[#0f0f0f]">
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/50 font-medium shrink-0">Grade</label>
            <select
              value={filterStdId}
              onChange={e => onSetFilterStdId(e.target.value)}
              className="bg-[#1a1a1a] border border-orange-500/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
            >
              <option value="">All</option>
              {allStandards.map(s => (
                <option key={getItemId(s)} value={getItemId(s)}>{s.code}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/50 font-medium shrink-0">Subject</label>
            <select
              value={filterSubId}
              onChange={e => onSetFilterSubId(e.target.value)}
              className="bg-[#1a1a1a] border border-orange-500/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary max-w-[120px]"
            >
              <option value="">All</option>
              {subjectsForFilter.map(s => (
                <option key={getItemId(s)} value={getItemId(s)}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/50 font-medium shrink-0">Unit</label>
            <select
              value={filterUnitId}
              onChange={e => onSetFilterUnitId(e.target.value)}
              className="bg-[#1a1a1a] border border-orange-500/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary max-w-[100px]"
            >
              <option value="">All</option>
              {unitsForFilter.map(u => (
                <option key={getItemId(u)} value={getItemId(u)}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/50 font-medium shrink-0">Chapter</label>
            <select
              value={filterChapterId}
              onChange={e => onSetFilterChapterId(e.target.value)}
              className="bg-[#1a1a1a] border border-orange-500/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary max-w-[120px]"
            >
              <option value="">All</option>
              {chaptersForFilter.map(c => (
                <option key={getItemId(c)} value={getItemId(c)}>{c.name}</option>
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
            <form onSubmit={onFormSubmit} className="space-y-4">
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
                      onChange={(e) => onSetFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      required={field.required}
                      placeholder={field.label}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      className="w-full px-3 py-2 bg-[#141414] border border-orange-500/20 rounded-xl focus:outline-none focus:border-primary transition text-sm text-white"
                      value={formData[field.key] || ""}
                      onChange={(e) => onSetFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
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
                     onSetItems(prev => prev.map(i => getItemId(i) === getItemId(editingItem) ? { ...i, videoUrl: url } : i));
                     onSetEditingItem(prev => ({ ...prev, videoUrl: url }));
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
              const metaFields = detailFields.filter(f => !["description", "content", "contentText", "videoUrl"].includes(f.key));
              const textFields = detailFields.filter(f => ["description", "content", "contentText"].includes(f.key));

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
                        <div className="mt-1 flex flex-col gap-0.5">
                          <p className="text-[10px] text-white/20 break-all font-mono">ID: {itemId}</p>
                          {item._id && (
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                              Created: {new Date(parseInt(item._id.substring(0, 8), 16) * 1000).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                     <div className="flex items-center gap-1 shrink-0">
                      {activeArea.update && (
                        <button
                           onClick={() => {
                             const pathMap = {
                               standards: "standards",
                               subjects: "subjects",
                               units: "units",
                               chapters: "chapters",
                               lessons: "lesson"
                             };
                             router.push(`/admin/${pathMap[activeArea.key]}/${itemId}`);
                           }}
                           className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                           title="Open Full Page Editor"
                         >
                           <span className="material-symbols-outlined text-[20px]">edit_square</span>
                         </button>
                      )}

                      {item.deletedAt && onRestore ? (
                        <button
                          onClick={() => onRestore(activeArea, itemId)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="Restore"
                        >
                          <span className="material-symbols-outlined text-[20px]">restore</span>
                        </button>
                      ) : (
                        onDelete && (
                          <button
                            onClick={() => onDelete(activeArea, itemId)}
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

                  {textFields.length > 0 && activeArea?.key !== "lessons" && (
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
                    <LessonChecklist lesson={item} standards={allStandards} chapters={allChapters} quizStatusMap={quizMap} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
