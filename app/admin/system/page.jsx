"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiFetch } from "../../../lib/api";
import Link from "next/link";

export default function AdminSystemPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useRequireAuth(["admin", "super"]);

  const [config, setConfig] = useState({ period: "weekly", lastReset: null });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const fetchSystemData = useCallback(async () => {
    try {
      setLoading(true);
      const [confRes, logsRes] = await Promise.all([
        apiFetch("/v1/admin/system/leaderboard"),
        apiFetch("/v1/admin/system/api-logs")
      ]);
      setConfig(confRes?.data ?? confRes ?? { period: "weekly", lastReset: null });
      setLogs(Array.isArray(logsRes?.data) ? logsRes.data : logsRes ?? []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const isSuper = authUser?.role === "admin" && (authUser?.adminType === "super" || !authUser?.adminType);
    if (!isSuper) {
        setError("ACCESS DENIED: Mission Control requires administrator clearance.");
        setLoading(false);
        return;
    }
    fetchSystemData();
    const interval = setInterval(async () => {
        const logsRes = await apiFetch("/v1/admin/system/api-logs").catch(() => null);
        if (logsRes) setLogs(prev => [...(logsRes?.data ?? logsRes), ...prev].slice(0, 50));
    }, 5000);
    return () => clearInterval(interval);
  }, [authLoading, authUser, fetchSystemData]);

  const updateConfig = async (newPeriod) => {
    try {
      const res = await apiFetch("/v1/admin/system/leaderboard", {
        method: "PATCH",
        body: JSON.stringify({ period: newPeriod })
      });
      setConfig(res?.data ?? res);
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  const resetLeaderboard = async () => {
    if (!confirm("CRITICAL ACTION: This will wipe ALL current student leaderboard scores. Proceed with caution.")) return;
    setIsResetting(true);
    try {
      await apiFetch("/v1/admin/system/leaderboard/reset", { method: "POST" });
      fetchSystemData();
      alert("Leaderboard system purged and recalibrated.");
    } catch (err) {
      alert("Reset failed: " + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !config.lastReset) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-rose-500/5 blur-[120px] pointer-events-none" />
            <span className="material-symbols-outlined text-7xl text-rose-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">shield_lock</span>
            <h1 className="text-3xl font-display font-black text-white uppercase italic mb-3 tracking-tight">Clearance Refused</h1>
            <p className="text-white/40 max-w-sm mb-10 text-sm leading-relaxed">{error}</p>
            <Link href="/admin" className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all shadow-xl active:scale-95">
                Return to Surface
            </Link>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 lg:p-8 pb-32 relative overflow-hidden selection:bg-primary/30">
       
       {/* ── Background Gradients ── */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600 blur-[120px]" />
       </div>

       <header className="relative z-10 flex items-center justify-between mb-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/60 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em]">SYSTEM_STABLE</span>
            </div>
            <h1 className="text-3xl font-display font-black tracking-tight uppercase italic text-white flex items-center gap-3">
                Mission Control <span className="text-[10px] not-italic bg-white/10 px-2 py-1 rounded text-white/40 border border-white/5 tracking-widest font-mono uppercase">Core</span>
            </h1>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-6 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
            <div className="text-center">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Uptime</p>
                <p className="text-sm font-bold text-white">99.998%</p>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Latency</p>
                <p className="text-sm font-bold text-emerald-400">42ms</p>
            </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-8">
            {/* LEADERBOARD CONTROLS */}
            <section className="bg-[#141414]/60 backdrop-blur-md border border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
                <h2 className="text-lg font-display font-black uppercase italic text-primary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">emoji_events</span>
                    Season Relay
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-2 mb-3 block text-center lg:text-left">Recalibration Period</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['daily', 'weekly', 'monthly'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => updateConfig(p)}
                                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        config.period === p 
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                        : 'bg-black/40 border-white/5 text-white/30 hover:border-white/20'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Last Global Reset</span>
                            <span className="text-[10px] font-mono text-white/40">{config.lastReset ? new Date(config.lastReset).toLocaleString() : 'PENDING'}</span>
                        </div>
                        <button
                            disabled={isResetting}
                            onClick={resetLeaderboard}
                            className="w-full py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all group active:scale-95"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg group-hover:animate-spin">autorenew</span>
                                Reset Scoreboard
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* SYSTEM STATUS CARD */}
            <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] p-8 backdrop-blur-sm">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">settings_input_component</span>
                    Core Protocols
                </h2>
                <div className="space-y-3">
                    {[
                        { label: 'API Gateway', status: 'Optimal', color: 'text-emerald-400' },
                        { label: 'DB Cluster', status: 'Stable', color: 'text-emerald-400' },
                        { label: 'OneSignal', status: 'Connected', color: 'text-emerald-400' },
                        { label: 'Asset CDN', status: 'Active', color: 'text-emerald-400' },
                    ].map(s => (
                        <div key={s.label} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <span className="text-xs font-bold text-white/40">{s.label}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.status}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        {/* API LOGS LIVE FEED */}
        <div className="lg:col-span-2">
            <section className="bg-[#050505]/80 backdrop-blur-xl border border-white/5 rounded-[3rem] p-6 lg:p-10 h-full flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-display font-black uppercase italic text-white flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10 shadow-lg shadow-orange-500/5">
                             <span className="material-symbols-outlined">terminal</span>
                        </div>
                        Intelligence Feed
                    </h2>
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Live Capture</span>
                    </div>
                </div>

                <div className="flex-1 min-h-[500px] bg-black/40 rounded-[2rem] border border-white/5 p-6 font-mono overflow-y-auto no-scrollbar relative shadow-inner">
                    <div className="space-y-1">
                        {logs.length === 0 ? (
                           <div className="h-full flex items-center justify-center text-white/10 flex-col gap-4 py-20">
                             <span className="material-symbols-outlined text-5xl">wifi_tethering_off</span>
                             <p className="text-xs font-bold uppercase tracking-widest">Awaiting incoming transmissions...</p>
                           </div>
                        ) : (
                          logs.map((log, i) => (
                              <div key={log.timestamp || i} className="flex items-start gap-4 text-[11px] py-1.5 border-b border-white/[0.03] last:border-0 group animate-in slide-in-from-top duration-300">
                                  <span className="text-white/20 shrink-0 tabular-nums">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                  <span className={`font-black shrink-0 w-12 ${
                                      log.method === 'POST' ? 'text-blue-400' : 
                                      log.method === 'PATCH' ? 'text-amber-400' : 
                                      log.method === 'DELETE' ? 'text-rose-400' : 'text-emerald-400'
                                  }`}>{log.method}</span>
                                  <span className="text-white/60 truncate flex-1 group-hover:text-white/90 transition-colors uppercase tracking-tight">{log.path}</span>
                                  <span className={`font-black shrink-0 ${log.status >= 400 ? 'text-rose-500' : 'text-emerald-500'}`}>{log.status}</span>
                                  <span className="text-white/10 ml-2 group-hover:text-white/30 transition-colors tabular-nums">{log.duration || '0ms'}</span>
                              </div>
                          ))
                        )}
                    </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                    <button onClick={() => setLogs([])} className="px-6 py-2 text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors tracking-widest">Clear Console</button>
                    <button onClick={fetchSystemData} className="px-6 py-2 text-[10px] font-black uppercase text-emerald-500/60 hover:text-emerald-400 transition-colors tracking-widest">Sync Intelligence</button>
                </div>
            </section>
        </div>

      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Syne:wght@800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

