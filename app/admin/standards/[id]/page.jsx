"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../../hooks/useRequireAuth";
import { apiFetch } from "../../../../lib/api";
import { updateStandard, listStandards } from "../../../../lib/admin-api";

import Link from "next/link";

export default function StandardEditorPage({ params }) {
  const resolvedParams = use(params);
  const standardId = resolvedParams.id;
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth(["admin"]);

  const [standard, setStandard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ code: "", name: "", orderIndex: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const res = await listStandards();
        const items = res?.data?.items ?? res?.items ?? res ?? [];
        const found = items.find(s => (s._id || s.id) === standardId);
        if (found) {
          setStandard(found);
          setFormData({
            code: found.code || "",
            name: found.name || "",
            orderIndex: found.orderIndex ?? ""
          });
        }
        setLoading(false);
      } catch (err) {
        console.error("Load error:", err);
        setLoading(false);
      }
    })();
  }, [authLoading, standardId]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const payload = { code: formData.code, name: formData.name };
      if (formData.orderIndex !== "") payload.orderIndex = Number(formData.orderIndex);
      await updateStandard(standardId, payload);
      setSuccess("Standard successfully updated in the orbit!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save standard");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white/40">
        <span className="material-symbols-outlined text-6xl mb-4">folder_off</span>
        <h1 className="text-xl font-bold">Standard Not Found</h1>
        <Link href="/admin/explorer" className="mt-4 text-primary font-bold">Return to Explorer</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/explorer")} className="p-2 rounded-xl group hover:bg-white/5 transition-all text-white/40">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-primary font-display">Edit Standard</h1>
            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">{standard.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => router.push("/admin/explorer")}
                className="p-2 rounded-xl border border-white/5 hover:border-primary transition-all text-white/40 hover:text-white"
            >
                <span className="material-symbols-outlined">account_tree</span>
            </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-12 space-y-12">
        <section className="bg-[#141414] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-1">Standard Code</label>
                        <input 
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-white font-bold focus:border-primary outline-none transition-all"
                            placeholder="e.g. STD-08"
                        />
                    </div>
                    <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-1">Standard Name</label>
                        <input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-white font-bold focus:border-primary outline-none transition-all"
                            placeholder="e.g. Grade 8 Standard"
                        />
                    </div>
                </div>

                <div className="space-y-2 max-w-[200px]">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-1">Global Position (Order)</label>
                    <input 
                        type="number"
                        value={formData.orderIndex}
                        onChange={(e) => setFormData({...formData, orderIndex: e.target.value})}
                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-white font-bold focus:border-primary outline-none transition-all"
                        placeholder="0"
                    />
                </div>

                {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-bold animate-in fade-in zoom-in">{success}</div>}
                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold">{error}</div>}

                <div className="pt-4">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"/> : <span className="material-symbols-outlined">save</span>}
                        {saving ? "SAVING CHANGES..." : "SAVE STANDARD INTELLIGENCE"}
                    </button>
                </div>
            </div>
        </section>

        <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-white/40 uppercase mb-1 tracking-widest">Child Statistics</p>
                <p className="text-sm font-black text-white/80">Managing subjects for this standard.</p>
            </div>
            <button 
                onClick={() => router.push("/admin/explorer")}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
            >
                View Explorer
            </button>
        </section>
      </main>

       <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
      `}</style>
    </div>
  );
}
