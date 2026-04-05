"use client";
import { useState } from "react";
import Link from "next/link";

export default function JobsPreviewPage() {
  const [status] = useState("Running");
  const [jobs] = useState([
    {
      _id: "job_8f2a1c3d9e",
      name: "Weekly Leaderboard Recalibration",
      lastRunAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      nextRunAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
      failedAt: null,
      failReason: null
    },
    {
      _id: "job_3d9e8f2a1c",
      name: "Student Mastery Sync (Batch)",
      lastRunAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      nextRunAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      failedAt: null,
      failReason: null
    },
    {
      _id: "job_1c3d9e8f2a",
      name: "Email Broadcast: Level Up Notifications",
      lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      nextRunAt: null,
      failedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
      failReason: "SMTP_CONNECTION_TIMEOUT: Connection to mail server dropped during handshake."
    }
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 lg:p-8 pb-12 selection:bg-primary/30 relative overflow-hidden">
      
      <div className="fixed top-0 right-0 p-4 z-[100]">
         <div className="bg-amber-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl animate-pulse">
            PREVIEW_MODE_ACTIVE
         </div>
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between mb-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/60 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${status === 'Running' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`}></span>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${status === 'Running' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {status === 'Running' ? 'SCHEDULER_ONLINE' : 'SCHEDULER_OFFLINE'}
                </span>
            </div>
            <h1 className="text-3xl font-display font-black tracking-tight uppercase italic text-white flex items-center gap-3">
                Background Logs <span className="text-[10px] not-italic bg-white/10 px-2 py-1 rounded text-white/40 border border-white/5 tracking-widest font-mono uppercase">Workers</span>
            </h1>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-6 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
            <div className="text-center">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Active Jobs</p>
                <p className="text-sm font-bold text-white">2</p>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Failures</p>
                <p className="text-sm font-bold text-rose-500">1</p>
            </div>
        </div>
      </header>

      <div className="relative z-10 grid grid-cols-1 gap-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {jobs.map((job, i) => (
               <div key={job._id || i} className="group relative bg-[#141414]/60 backdrop-blur-md border border-white/5 p-6 lg:p-8 rounded-[3rem] hover:border-primary/40 transition-all shadow-2xl flex flex-col justify-between gap-6">
                  
                  <div className="flex gap-6 items-start">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 border ${
                          job.failedAt ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                          job.nextRunAt ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          'bg-primary/10 text-primary border-primary/20'
                      }`}>
                          <span className="material-symbols-outlined text-3xl">{job.failedAt ? 'report' : 'settings_suggest'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-xl font-display font-black uppercase italic text-white tracking-wide truncate">{job.name}</h3>
                              <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${
                                  job.failedAt ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' :
                                  job.nextRunAt ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                                  'bg-white/10 border-white/10 text-white/40'
                              }`}>
                                  {job.failedAt ? 'Failed' : job.nextRunAt ? 'Next Run Ready' : 'Processed'}
                              </span>
                          </div>
                          <p className="text-[10px] text-white/20 font-mono mb-6 truncate uppercase tracking-tighter">Task Reference: {job._id}</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-black/20 p-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                                  <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1.5">Last Transmission</p>
                                  <p className="text-[11px] font-bold text-white/60 truncate">{job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : 'PENDING'}</p>
                              </div>
                              <div className="bg-black/20 p-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                                  <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1.5">Next Sequence</p>
                                  <p className={`text-[11px] font-bold truncate ${job.nextRunAt ? 'text-emerald-400' : 'text-white/30'}`}>
                                      {job.nextRunAt ? new Date(job.nextRunAt).toLocaleString() : 'MANUAL_ONLY'}
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
                      {job.failedAt && (
                          <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
                              <span className="material-symbols-outlined text-lg">refresh</span>
                              Restore Sequence
                          </button>
                      )}
                      <button className="p-4 bg-rose-500/5 text-rose-400 border border-rose-500/10 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90" title="Purge Task">
                          <span className="material-symbols-outlined text-xl">delete_sweep</span>
                      </button>
                  </div>

                  {job.failReason && (
                      <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in slide-in-from-bottom duration-500">
                           <div className="flex items-center gap-2 mb-1.5">
                              <span className="material-symbols-outlined text-rose-400 text-base">running_with_errors</span>
                              <span className="text-[9px] font-black uppercase text-rose-300 tracking-widest">Failure Diagnosis</span>
                           </div>
                           <p className="text-xs font-medium text-rose-200/70 leading-relaxed font-mono">{job.failReason}</p>
                      </div>
                  )}
               </div>
            ))}
          </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Syne:wght@800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
    </div>
  );
}
