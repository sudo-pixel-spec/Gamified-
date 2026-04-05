"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiFetch } from "../../lib/api";
import Link from "next/link";

export default function StudentNotificationsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useRequireAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/v1/notifications").catch(() => null);
      if (res?.data) {
        const d = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        setNotifications(d);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  /* ── handlers ── */
  const handleNotificationClick = useCallback((n) => {
    // Priority 1: Direct Lesson Link
    if (n.lessonId) {
        router.push(`/lesson?lessonId=${n.lessonId}`);
        return;
    }
    // Priority 2: Subject/Structure Link
    if (n.subjectId) {
        router.push(`/structure?subjectId=${n.subjectId}`);
        return;
    }
    // Priority 3: Grade/Standard Link
    if (n.standardId) {
        router.push(`/dashboard`); // Or specific standard view if implemented
        return;
    }
    // Default: Just stay on page or mark as read logic could go here
  }, [router]);

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [authLoading, fetchData]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background blobs */}
      <div className="fixed top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <nav className="border-b border-orange-500/20 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
             <Link href="/dashboard" className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40 hover:text-white transition-colors">arrow_back</span>
                <span className="font-display font-black text-xl tracking-tight text-white italic uppercase">Intelligence Inbox</span>
             </Link>
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Active Fleet: {authUser?.profile?.standard || 'Grade Unknown'}</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-12">
            <h1 className="text-4xl font-display font-black uppercase italic text-white tracking-tighter mb-2">Comms Center</h1>
            <p className="text-white/40 font-medium leading-relaxed">Incoming transmissions from Mission Control. Read briefing messages and stay ahead of your missions.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/5 opacity-50">
                <span className="material-symbols-outlined text-6xl mb-4 text-white/20">mail_lock</span>
                <p className="text-lg font-bold italic tracking-tight uppercase text-white/20">Zero transmissions detected in your sector.</p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <div 
                key={n._id || i} 
                onClick={() => handleNotificationClick(n)}
                className="group bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 hover:border-primary/40 hover:bg-primary/5 transition-all relative overflow-hidden flex flex-col md:flex-row gap-8 items-start cursor-pointer group"
              >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="w-16 h-16 rounded-[1.5rem] bg-black/40 border border-white/5 flex items-center justify-center shrink-0 text-primary shadow-inner">
                        <span className="material-symbols-outlined text-4xl">
                            {n.role === 'event' ? 'celebration' : n.role === 'milestone' ? 'workspace_premium' : 'satellite_alt'}
                        </span>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                n.role === 'event' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-primary/10 border-primary/20 text-primary'
                           }`}>
                                {n.role || 'broadcast'}
                           </span>
                        </div>
                        <h3 className="text-xl font-display font-black uppercase italic text-white mb-2 leading-none group-hover:text-primary transition-colors tracking-tighter">{n.title}</h3>
                        <p className="text-sm text-white/60 leading-relaxed max-w-2xl">{n.message}</p>
                    </div>

                    <div className="shrink-0 flex items-center justify-center -mr-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 hidden md:flex">
                        <span className="material-symbols-outlined text-white/20">chevron_right</span>
                    </div>
              </div>
            ))
          )}
        </div>
        
        <footer className="mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] mb-4">Transmission End</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">home</span>
                Return to Dashboard
            </Link>
        </footer>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
