"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function MissionControlPreview() {
  const [logs, setLogs] = useState([]);
  const [period, setPeriod] = useState("weekly");

  // Mock initial logs
  useEffect(() => {
    const mockLogs = [
      { timestamp: Date.now() - 1000, method: "GET", path: "/v1/curriculum/lessons", status: 200, duration: "42ms" },
      { timestamp: Date.now() - 5000, method: "POST", path: "/v1/auth/verify-otp", status: 201, duration: "1.2s" },
      { timestamp: Date.now() - 12000, method: "PATCH", path: "/v1/admin/chapters", status: 200, duration: "88ms" },
      { timestamp: Date.now() - 18000, method: "DELETE", path: "/v1/admin/units/65f2...", status: 403, duration: "12ms" },
      { timestamp: Date.now() - 25000, method: "GET", path: "/v1/me", status: 200, duration: "5ms" },
      { timestamp: Date.now() - 30000, method: "POST", path: "/v1/admin/quizzes", status: 201, duration: "250ms" },
    ];
    setLogs(mockLogs);

    const interval = setInterval(() => {
      const paths = ["/v1/curriculum/subjects", "/v1/metrics", "/v1/auth/google", "/v1/admin/audit", "/v1/curriculum/standards"];
      const methods = ["GET", "POST", "PATCH", "DELETE"];
      const statuses = [200, 201, 403, 500, 404];
      
      const newLog = {
        timestamp: Date.now(),
        method: methods[Math.floor(Math.random() * methods.length)],
        path: paths[Math.floor(Math.random() * paths.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        duration: `${Math.floor(Math.random() * 500)}ms`
      };
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 lg:p-8 pb-32 selection:bg-primary/30">
       <header className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white/40 hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em]">SYSTEM_STABLE</span>
            </div>
            <h1 className="text-3xl font-display font-black tracking-tight uppercase italic text-white flex items-center gap-3">
                Mission Control <span className="text-[10px] not-italic bg-white/10 px-2 py-1 rounded text-white/40 border border-white/5 tracking-widest font-mono">PREVIEW_MODE</span>
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
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Region</p>
                <p className="text-sm font-bold text-white">OR-WEST-1</p>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-8">
            {/* LEADERBOARD CONTROLS */}
            <section className="bg-[#141414] border border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                <h2 className="text-lg font-display font-black uppercase italic text-primary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">emoji_events</span>
                    Season Relay
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-2 mb-3 block">Recalibration Period</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['daily', 'weekly', 'monthly'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        period === p 
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
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-white/40 italic">Last Global Reset</span>
                            <span className="text-[10px] font-mono text-white/60">05/04/2026, 12:00:00</span>
                        </div>
                        <button
                            className="w-full py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all group"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg group-hover:animate-spin">autorenew</span>
                                Global Reset Scoreboard
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* SYSTEM STATUS CARD */}
            <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] p-8">
                 <h2 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">settings_input_component</span>
                    Core Protocols
                </h2>
                <div className="space-y-4">
                    {[
                        { label: 'API Gateway', status: 'Optimal', color: 'text-emerald-400' },
                        { label: 'DB Cluster', status: 'Stable', color: 'text-emerald-400' },
                        { label: 'OneSignal', status: 'Connected', color: 'text-emerald-400' },
                        { label: 'Asset CDN', status: '94ms Latency', color: 'text-orange-400' },
                    ].map(s => (
                        <div key={s.label} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <span className="text-xs font-bold text-white/60">{s.label}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.status}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        {/* API LOGS LIVE FEED */}
        <div className="lg:col-span-2">
            <section className="bg-[#050505] border border-white/5 rounded-[3rem] p-8 h-full flex flex-col shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-display font-black uppercase italic text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                             <span className="material-symbols-outlined">terminal</span>
                        </span>
                        API Intelligence Feed
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Live Capture</span>
                    </div>
                </div>

                <div className="flex-1 min-h-[500px] bg-black/40 rounded-2xl border border-white/5 p-4 font-mono overflow-y-auto no-scrollbar relative">
                    <div className="space-y-2">
                        {logs.map((log, i) => (
                            <div key={i} className="flex items-start gap-4 text-[11px] py-1 border-b border-white/5 last:border-0 group animate-in slide-in-from-top duration-300">
                                <span className="text-white/20 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className={`font-black shrink-0 w-12 ${
                                    log.method === 'POST' ? 'text-blue-400' : 
                                    log.method === 'PATCH' ? 'text-amber-400' : 
                                    log.method === 'DELETE' ? 'text-rose-400' : 'text-emerald-400'
                                }`}>{log.method}</span>
                                <span className="text-white/70 truncate flex-1">{log.path}</span>
                                <span className={`font-bold shrink-0 ${log.status >= 400 ? 'text-rose-500' : 'text-emerald-500'}`}>{log.status}</span>
                                <span className="text-white/20 ml-2 group-hover:text-white/40 transition-colors">{log.duration}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                    <button onClick={() => setLogs([])} className="px-4 py-2 text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors">Clear Console</button>
                    <button className="px-4 py-2 text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors">Refresh Frame</button>
                </div>
            </section>
        </div>

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
