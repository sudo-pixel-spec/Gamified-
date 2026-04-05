"use client";

import React from "react";
import { useRouter } from "next/navigation";

function StatCard({ label, value, up }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-orange-500/10 bg-[#141414] p-5 shadow-lg group hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</span>
        {up && <span className="material-symbols-outlined text-emerald-500 text-sm animate-pulse">trending_up</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black font-display italic tracking-tight text-white">{value}</span>
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Units Active</span>
      </div>
    </div>
  );
}

export default function DashboardStats({ counts }) {
  const router = useRouter();
  
  return (
    <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <StatCard label="Total Standards" value={counts.standards} up />
      <StatCard label="Active Lessons"  value={counts.lessons} up />
      <button 
        onClick={() => router.push("/admin/explorer")}
        className="col-span-2 lg:col-span-1 bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between group hover:bg-primary/20 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">account_tree</span>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Hierarchy View</p>
            <p className="font-bold text-sm text-white">Full Curriculum Tree</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-white/20 group-hover:text-primary transition-colors">chevron_right</span>
      </button>
    </section>
  );
}
