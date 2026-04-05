"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiFetch } from "../../../lib/api";
import { listStandards } from "../../../lib/admin-api";
import Link from "next/link";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useRequireAuth(["admin"]);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [standards, setStandards] = useState([]);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "platform",
    targetType: "all",
    targetValue: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [notifRes, stdsRes] = await Promise.all([
        apiFetch("/v1/admin/notifications"),
        listStandards()
      ]);
      setNotifications(Array.isArray(notifRes?.data) ? notifRes.data : notifRes?.data?.items ?? notifRes ?? []);
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

  const handleSend = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await apiFetch("/v1/admin/notifications", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          target: {
            type: formData.targetType,
            value: formData.targetValue || undefined
          }
        })
      });
      setShowModal(false);
      setFormData({ title: "", message: "", type: "platform", targetType: "all", targetValue: "" });
      fetchData();
    } catch (err) {
      alert("Failed to send notification: " + err.message);
    } finally {
      setFormLoading(false);
    }
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
            <h1 className="text-2xl font-display font-black tracking-tight uppercase italic text-primary">Notification Center</h1>
            <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">Broadcast messages to your fleet</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <span className="material-symbols-outlined text-lg">send</span>
          New Broadcast
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6 max-w-6xl mx-auto flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 max-w-6xl mx-auto">
        {notifications.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/5 opacity-50">
            <span className="material-symbols-outlined text-6xl mb-4">mail_lock</span>
            <p className="text-lg font-bold italic tracking-tight uppercase">No previous broadcasts found.</p>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <div key={notif._id || i} className="bg-[#141414] border border-white/5 p-6 rounded-[2rem] hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-2xl flex items-center justify-center ${
                    notif.type === 'push' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    <span className="material-symbols-outlined">{notif.type === 'push' ? 'notifications_active' : 'campaign'}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{notif.title}</h3>
                    <p className="text-sm text-white/60 mb-2">{notif.message}</p>
                    <div className="flex gap-2 flex-wrap">
                       <span className="text-[10px] font-black uppercase text-white/30 border border-white/10 px-2 py-0.5 rounded">Target: {notif.target?.type || 'All'}</span>
                       {notif.target?.value && <span className="text-[10px] font-black uppercase text-primary border border-primary/20 px-2 py-0.5 rounded">{notif.target.value}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black uppercase text-white/20 tracking-tighter">{new Date(notif.createdAt).toLocaleDateString()}</p>
                  <p className="text-[10px] text-white/20 font-mono">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SEND MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0a0aff]/90 backdrop-blur-xl">
          <div className="w-full max-w-lg bg-[#141414] border border-white/10 rounded-[3rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-display font-black uppercase italic text-primary mb-6">Launch Broadcast</h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Message Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                  placeholder="Atmosphere Alert!"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Payload Message</label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
                  placeholder="Your mission for today has arrived..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Delivery Method</label>
                    <select 
                        value={formData.type}
                        onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none"
                    >
                        <option value="platform">Platform Inbox</option>
                        <option value="push">Push Notification</option>
                        <option value="both">Both</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Target Fleet</label>
                    <select
                        checked={formData.targetType}
                        onChange={e => setFormData(p => ({ ...p, targetType: e.target.value, targetValue: '' }))}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none"
                    >
                        <option value="all">Everyone</option>
                        <option value="standard">Specific Grade</option>
                        <option value="user">Specific User ID</option>
                    </select>
                 </div>
              </div>

              {formData.targetType === 'standard' && (
                <div>
                   <label className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">Select Grade</label>
                   <select 
                      value={formData.targetValue}
                      onChange={e => setFormData(p => ({ ...p, targetValue: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none"
                   >
                      <option value="">-- Choose Grade --</option>
                      {standards.map(s => <option key={s._id || s.id} value={s.code}>{s.name} ({s.code})</option>)}
                   </select>
                </div>
              )}

              {formData.targetType === 'user' && (
                <div>
                   <label className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-2 mb-1.5 block">User Database ID</label>
                   <input 
                      value={formData.targetValue}
                      onChange={e => setFormData(p => ({ ...p, targetValue: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs font-mono focus:border-primary focus:outline-none"
                      placeholder="65e...3af"
                   />
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-4 mt-4 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-primary/20"
              >
                {formLoading ? 'Synchronizing...' : 'Ignite Broadcast'}
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
