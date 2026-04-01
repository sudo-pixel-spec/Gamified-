"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiFetch } from "../../lib/api";
import Link from "next/link";

export default function DebugCurriculumPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [stdsRes, meRes] = await Promise.all([
          apiFetch("/v1/curriculum/standards"),
          apiFetch("/v1/me")
        ]);
        
        if (cancelled) return;
        
        const stdList = stdsRes?.data || stdsRes || [];
        setStandards(stdList);
        setMe(meRes?.data || meRes);

        // Fetch counts for each standard (sequentially to avoid rate limits)
        const enriched = [];
        for (const std of stdList) {
          const stdId = std._id || std.id;
          try {
            const subRes = await apiFetch(`/v1/curriculum/subjects?standardId=${stdId}`);
            const subjects = subRes?.data || subRes || [];
            
            let totalChapters = 0;
            let totalLessons = 0;

            for (const sub of subjects) {
              const subId = sub._id || sub.id;
              const unitRes = await apiFetch(`/v1/units?subjectId=${subId}`);
              const units = unitRes?.data || unitRes || [];
              
              for (const unit of units) {
                const unitId = unit._id || unit.id;
                const chapRes = await apiFetch(`/v1/chapters?unitId=${unitId}`);
                const chapters = chapRes?.data || chapRes || [];
                totalChapters += chapters.length;

                for (const chap of chapters) {
                  const chapId = chap._id || chap.id;
                  const lessonRes = await apiFetch(`/v1/lessons?chapterId=${chapId}`);
                  const lessons = lessonRes?.data || lessonRes || [];
                  totalLessons += lessons.length;
                }
              }
            }
            enriched.push({ ...std, countChapters: totalChapters, countLessons: totalLessons });
          } catch (e) {
            enriched.push({ ...std, countChapters: "?", countLessons: "?" });
          }
          if (cancelled) return;
          setStandards([...enriched]);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load standards");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authLoading]);

  const handleSelect = async (stdId) => {
    setSyncing(stdId);
    try {
      await apiFetch("/v1/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: me?.profile?.fullName || "Learner",
          standard: stdId,
          timezone: me?.profile?.timezone || "Asia/Kolkata",
        }),
      });
      alert("✓ Profile updated successfully! Redirecting to Dashboard...");
      router.push("/dashboard");
    } catch (err) {
      alert("❌ Sync failed: " + err.message);
    } finally {
      setSyncing(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentStdId = me?.profile?.standardId || me?.profile?.standard;


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <header className="max-w-6xl mx-auto mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-widest uppercase text-primary mb-2">Diagnostic Data Hub</h1>
          <p className="text-white/40 text-sm">Identifying duplicate curriculum versions in your database.</p>
        </div>
        <Link href="/dashboard" className="px-5 py-2.5 rounded-xl border border-orange-500/20 text-white/60 hover:bg-white/5 transition-colors text-sm font-bold">
          Back to Dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto">
        {loading && standards.length === 0 ? (
          <div className="flex justify-center p-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold mb-8">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-orange-500/20 bg-[#111111] shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-orange-500/10 text-[10px] uppercase font-black tracking-[0.2em] text-white/30">
                  <th className="px-6 py-5">Standard ID</th>
                  <th className="px-6 py-5">Code / Name</th>
                  <th className="px-6 py-5 text-center">Chapters</th>
                  <th className="px-6 py-5 text-center text-primary">Lessons</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-500/5">
                {standards.map((std) => {
                  const stdId = std._id || std.id;
                  const isCurrent = String(stdId) === String(currentStdId);
                  
                  return (
                    <tr key={stdId} className={`group hover:bg-orange-500/5 transition-colors ${isCurrent ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-5 font-mono text-[11px] text-white/40 select-all">{stdId}</td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-white">{std.name}</div>
                        <div className="text-[10px] text-white/30 font-mono italic">{std.code}</div>
                      </td>
                      <td className="px-6 py-5 text-center font-bold">{std.countChapters ?? "..."}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[15px] font-black ${std.countLessons >= 15 ? 'text-primary' : 'text-white/60'}`}>
                          {std.countLessons ?? "..."}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            Current Standard
                          </span>
                        ) : (
                          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">Available</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleSelect(stdId)}
                          disabled={syncing !== null || isCurrent}
                          className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            isCurrent
                              ? "bg-white/5 text-white/20 cursor-default"
                              : syncing === stdId
                                ? "bg-amber-500 text-white animate-pulse"
                                : "bg-primary text-white hover:bg-orange-600 shadow-lg shadow-primary/20 active:scale-95"
                          }`}
                        >
                          {syncing === stdId ? "Syncing..." : isCurrent ? "Active" : "Select for Profile"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-12 p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 max-w-2xl">
          <h3 className="text-amber-500 font-display font-black text-xl mb-3 flex items-center gap-2">
            <span className="material-symbols-rounded">warning</span>
            Why am I seeing multiple entries?
          </h3>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            If you have run the "Seeding Pipeline" multiple times, the database may have created duplicate 
            Standards with the same code (<code className="text-primary font-mono text-xs">grade_8</code>).
          </p>
          <ul className="space-y-2 text-xs text-white/40">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              Look for the row with **15 Lessons**—this is your target curriculum.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              Click **Select for Profile** to connect your account to that specific database version.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
