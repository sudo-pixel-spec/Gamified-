"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiFetch } from "../../../lib/api";
import { listStandards } from "../../../lib/admin-api";
import Link from "next/link";

export default function AdminEventsPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth(["admin", "super_admin"]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [standards, setStandards] = useState([]);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    type: "challenge",
    rewardXp: 500,
    rewardBadges: [],
    standardIds: []
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsRes, stdsRes] = await Promise.all([
        apiFetch("/v1/admin/events"),
        listStandards()
      ]);
      setEvents(Array.isArray(eventsRes?.data) ? eventsRes.data : eventsRes?.data?.items ?? eventsRes ?? []);
      setStandards(Array.isArray(stdsRes?.data) ? stdsRes.data : stdsRes?.data?.items ?? stdsRes ?? []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [authLoading, fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        type: formData.type,
        rewards: {
          xp: Number(formData.rewardXp),
          badges: formData.rewardBadges
        },
        standardIds: formData.standardIds,
        status: "published"
      };

      if (editingEvent) {
        await apiFetch(`/v1/admin/events/${editingEvent._id || editingEvent.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch("/v1/admin/events", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      
      setShowModal(false);
      setEditingEvent(null);
      fetchData();
    } catch (err) {
      alert("Failed to save event: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This event will be removed from all student dashboards.")) return;
    try {
      await apiFetch(`/v1/admin/events/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const openCreate = () => {
    setEditingEvent(null);
    setFormData({
        title: "",
        description: "",
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        type: "challenge",
        rewardXp: 500,
        rewardBadges: [],
        standardIds: []
    });
    setShowModal(true);
  };

  const openEdit = (ev) => {
    setEditingEvent(ev);
    setFormData({
        title: ev.title,
        description: ev.description || "",
        startDate: new Date(ev.startDate).toISOString().slice(0, 16),
        endDate: new Date(ev.endDate).toISOString().slice(0, 16),
        type: ev.type,
        rewardXp: ev.rewards?.xp ?? 0,
        rewardBadges: ev.rewards?.badges ?? [],
        standardIds: ev.standardIds ?? []
    });
    setShowModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-24">
      <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-black tracking-tight uppercase italic text-primary">Platform Events</h1>
            <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">Engage students with time-limited missions</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
        >
          <span className="material-symbols-outlined text-lg">celebration</span>
          Create Event
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6 max-w-6xl mx-auto flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {events.length === 0 ? (
          <div className="md:col-span-2 py-24 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/5 opacity-50">
            <span className="material-symbols-outlined text-6xl mb-4">history_toggle_off</span>
            <p className="text-lg font-bold italic tracking-tight uppercase">No events scheduled at mission control.</p>
          </div>
        ) : (
          events.map((ev, i) => (
            <div key={ev._id || i} className="group relative bg-[#141414] border border-white/5 p-8 rounded-[2.5rem] hover:border-primary/40 transition-all flex flex-col justify-between">
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        ev.type === 'competition' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}>
                        {ev.type}
                      </span>
                      <div className="flex gap-1">
                          <button onClick={() => openEdit(ev)} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                              <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => handleDelete(ev._id || ev.id)} className="p-2 hover:bg-white/5 rounded-lg text-rose-500 hover:text-rose-400 transition-colors">
                              <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                      </div>
                   </div>
                   <h3 className="text-xl font-display font-black uppercase italic text-white tracking-wide mb-2 line-clamp-1">{ev.title}</h3>
                   <p className="text-sm text-white/50 mb-6 line-clamp-2">{ev.description}</p>
                   
                   <div className="space-y-3 mb-6 bg-black/40 p-5 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between text-xs font-bold text-white/60">
                        <span>Launch:</span>
                        <span className="text-white font-mono">{new Date(ev.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-white/60">
                        <span>Expiry:</span>
                        <span className="text-rose-400 font-mono">{new Date(ev.endDate).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Reward XP</span>
                        <span className="text-lg font-bold text-primary">+{ev.rewards?.xp ?? 0}</span>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Target Grades</span>
                        <span className="text-xs font-bold text-white/60">{(ev.standardIds ?? []).length} Allotted</span>
                    </div>
                </div>
            </div>
          ))
        )}
      </div>

      {/* EVENT FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0a0aff]/90 backdrop-blur-xl overflow-y-auto">
          <div className="w-full max-w-xl bg-[#141414] border border-white/10 rounded-[3rem] p-8 shadow-2xl relative my-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-display font-black uppercase italic text-primary mb-8 px-2">
                {editingEvent ? 'Modify Mission' : 'Calibrate New Mission'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Mission Title</label>
                    <input
                      required
                      value={formData.title}
                      onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                      placeholder="Space Dash Competition"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Launch Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Landing Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none border-rose-500/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Briefing Description</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Event Type</label>
                    <select
                        value={formData.type}
                        onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-primary"
                    >
                        <option value="challenge">Challenge</option>
                        <option value="competition">Competition</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Reward Base XP</label>
                    <input
                      type="number"
                      required
                      value={formData.rewardXp}
                      onChange={e => setFormData(p => ({ ...p, rewardXp: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-primary"
                    />
                  </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-white/40 tracking-widest pl-2 mb-3 block text-emerald-400">Target Allotted Grades</label>
                <div className="flex flex-wrap gap-2">
                    {standards.map(s => (
                        <button
                            key={s._id || s.id}
                            type="button"
                            onClick={() => {
                                const id = String(s._id || s.id);
                                const current = formData.standardIds;
                                if (current.includes(id)) {
                                    setFormData(p => ({ ...p, standardIds: current.filter(x => x !== id) }));
                                } else {
                                    setFormData(p => ({ ...p, standardIds: [...current, id] }));
                                }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                formData.standardIds.includes(String(s._id || s.id))
                                ? 'bg-primary border-primary text-white'
                                : 'bg-black/40 border-white/10 text-white/40 hover:border-primary/50'
                            }`}
                        >
                            {s.code}
                        </button>
                    ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-primary/30"
              >
                {formLoading ? 'Calibrating...' : editingEvent ? 'Apply Modifications' : 'Initialize Mission'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
      `}</style>
    </div>
  );
}
