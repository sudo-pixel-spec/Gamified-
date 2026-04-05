"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiFetch } from "../../../lib/api";
import Link from "next/link";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useRequireAuth(["admin", "super"]);

  const [metrics, setMetrics] = useState(null);
  const [retention, setRetention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [metRes, retRes] = await Promise.all([
        apiFetch("/v1/admin/metrics"),
        apiFetch("/v1/admin/retention")
      ]);
      setMetrics(metRes?.data ?? metRes);
      setRetention(retRes?.data ?? retRes);
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

  const cohortData = useMemo(() => {
    if (!retention?.cohort) return [];
    return Object.entries(retention.cohort).map(([date, stats]) => ({
      date,
      total: stats.total,
      active: stats.active,
      pct: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [retention]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const widgets = metrics?.widgets ?? {};
  const charts = metrics?.charts ?? {};

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 lg:p-8 pb-32">
       <header className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white/40 hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight uppercase italic text-primary flex items-center gap-3">
                System Analytics
            </h1>
            <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] mt-1">Global Intelligence & Retention</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        
        {/* STAT GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
                { label: 'Total Fleet', value: widgets.totalUsers ?? 0, icon: 'groups', sub: 'Learners' },
                { label: 'Active (24h)', value: widgets.activeUsersToday ?? 0, icon: 'bolt', sub: 'DAU' },
                { label: 'Active (7d)', value: widgets.activeUsersWeek ?? 0, icon: 'analytics', sub: 'WAU' },
                { label: 'Growth (30d)', value: widgets.newRegistrationsMonth ?? 0, icon: 'trending_up', sub: 'New Signups' },
                { label: 'Total Quizzes', value: widgets.quizzesTaken ?? 0, icon: 'quiz', sub: 'Attempts' },
            ].map(w => (
                <div key={w.label} className="bg-[#141414] border border-white/5 p-6 rounded-[2rem] hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-white/30 uppercase">{w.label}</span>
                        <span className="material-symbols-outlined text-primary text-lg">{w.icon}</span>
                    </div>
                    <p className="text-3xl font-display font-black text-white italic">{w.value.toLocaleString()}</p>
                    <p className="text-[9px] font-black uppercase text-white/20 mt-1">{w.sub}</p>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* GROWTH CHART MOCKUP (Using high-end UI) */}
            <section className="bg-[#141414] border border-white/5 p-8 rounded-[3rem]">
                <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-8">User Growth (Last 30 Days)</h2>
                <div className="h-64 flex items-end gap-1">
                    {(charts.userGrowth ?? []).slice(-30).map((d, i) => (
                        <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-sm relative group" style={{ height: `${Math.max(10, (d.count / (Math.max(...charts.userGrowth?.map(x => x.count), 1) || 1)) * 100)}%` }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-[9px] px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.date}: {d.count}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-[9px] font-black text-white/20 uppercase">
                    <span>30 Days Ago</span>
                    <span>Baseline Orbit</span>
                    <span>Today</span>
                </div>
            </section>

            {/* DAU CHART MOCKUP */}
            <section className="bg-[#141414] border border-white/5 p-8 rounded-[3rem]">
                <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-8">Daily Engagement (DAU)</h2>
                <div className="h-64 flex items-end gap-2">
                    {(charts.dailyActiveUsers ?? []).slice(-7).map((d, i) => (
                        <div key={i} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500 transition-all rounded-xl relative group" style={{ height: `${Math.max(20, (d.count / (Math.max(...charts.dailyActiveUsers?.map(x => x.count), 1) || 1)) * 100)}%` }}>
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-[9px] px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.date}: {d.count}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-between mt-4 text-[9px] font-black text-white/20 uppercase">
                    <span>7 Days Ago</span>
                    <span>Activity Frequency</span>
                    <span>Active Today</span>
                </div>
            </section>
        </div>

        {/* RETENTION COHORT TABLE */}
        <section className="bg-[#141414] border border-white/5 p-10 rounded-[3rem]">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-display font-black uppercase italic text-white tracking-widest">Retention Metrics</h2>
               <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">W1 Stickiness: {cohortData[0]?.pct ?? 0}%</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="pb-4 text-[10px] font-black uppercase text-white/30 tracking-widest">Join Cohort</th>
                            <th className="pb-4 text-[10px] font-black uppercase text-white/30 tracking-widest">Users</th>
                            <th className="pb-4 text-[10px] font-black uppercase text-white/30 tracking-widest text-center">W1 Active</th>
                            <th className="pb-4 text-[10px] font-black uppercase text-white/30 tracking-widest text-right">Retention Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {cohortData.slice(0, 7).map((c, i) => (
                            <tr key={i} className="group hover:bg-white/5 transition-colors">
                                <td className="py-6 font-mono text-sm text-white font-bold">{c.date}</td>
                                <td className="py-6 text-sm text-white/60">{c.total}</td>
                                <td className="py-6 text-center">
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">{c.active}</span>
                                </td>
                                <td className="py-6 text-right">
                                    <div className="flex items-center justify-end gap-3 font-bold">
                                        <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${
                                                    c.pct > 50 ? 'bg-emerald-500' : c.pct > 25 ? 'bg-orange-500' : 'bg-rose-500'
                                                }`} 
                                                style={{ width: `${c.pct}%` }}
                                            ></div>
                                        </div>
                                        <span className={c.pct > 50 ? 'text-emerald-400' : 'text-white'}>{c.pct}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

      </main>

       <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
      `}</style>
    </div>
  );
}
