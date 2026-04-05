"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../../hooks/useRequireAuth";
import { apiFetch } from "../../../../lib/api";
import { updateUnit, listUnits, listSubjects } from "../../../../lib/admin-api";

import Link from "next/link";

export default function UnitEditorPage({ params }) {
  const resolvedParams = use(params);
  const unitId = resolvedParams.id;
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth(["admin"]);

  const [unit, setUnit] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", subjectId: "", orderIndex: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const [unitRes, subsRes] = await Promise.all([
          listUnits(),
          listSubjects()
        ]);
        
        const allUnits = unitRes?.data?.items ?? unitRes?.items ?? unitRes ?? [];
        const found = allUnits.find(u => (u._id || u.id) === unitId);
        
        if (found) {
          setUnit(found);
          setFormData({
            name: found.name || "",
            subjectId: found.subjectId?._id || found.subjectId?.id || found.subjectId || "",
            orderIndex: found.orderIndex ?? ""
          });
        }
        setSubjects(subsRes?.data?.items ?? subsRes?.items ?? subsRes ?? []);
        setLoading(false);
      } catch (err) {
        console.error("Load error:", err);
        setLoading(false);
      }
    })();
  }, [authLoading, unitId]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const payload = { name: formData.name, subjectId: formData.subjectId };
      if (formData.orderIndex !== "") payload.orderIndex = Number(formData.orderIndex);
      await updateUnit(unitId, payload);
      setSuccess("Unit data architecture updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save unit");
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

  if (!unit) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white/40">
        <span className="material-symbols-outlined text-6xl mb-4">folder_off</span>
        <h1 className="text-xl font-bold">Unit Not Found</h1>
        <Link href="/admin/explorer" className="mt-4 text-primary font-bold">Return to Explorer</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/explorer")} className="p-2 rounded-xl group hover:bg-white/5 transition-all text-white/40">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-lg">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-purple-400 font-display">Unit Editor</h1>
            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">{unit.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => router.push("/admin/explorer")}
                className="p-2 rounded-xl border border-white/5 hover:border-purple-400 transition-all text-white/40 hover:text-white"
            >
                <span className="material-symbols-outlined text-lg">account_tree</span>
            </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-12 space-y-12">
        <section className="bg-[#141414] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-1">Parent Subject</label>
                        <select 
                            value={formData.subjectId}
                            onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-white font-bold focus:border-purple-400 outline-none transition-all appearance-none"
                        >
                            <option value="" disabled>Select Subject</option>
                            {subjects.map(s => <option key={s._id||s.id} value={s._id||s.id} className="bg-slate-900">{s.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-1">Unit Name</label>
                        <input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-white font-bold focus:border-purple-400 outline-none transition-all"
                            placeholder="e.g. Unit 1: Foundations"
                        />
                    </div>
                </div>

                <div className="space-y-2 max-w-[200px]">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-1">Sequence Order</label>
                    <input 
                        type="number"
                        value={formData.orderIndex}
                        onChange={(e) => setFormData({...formData, orderIndex: e.target.value})}
                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-white font-bold focus:border-purple-400 outline-none transition-all"
                        placeholder="0"
                    />
                </div>

                {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-bold animate-in fade-in zoom-in">{success}</div>}
                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold">{error}</div>}

                <div className="pt-4">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"/> : <span className="material-symbols-outlined text-lg">save</span>}
                        {saving ? "SAVING UNIT..." : "CONFIRM UNIT DATA"}
                    </button>
                </div>
            </div>
        </section>

        <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-white/40 uppercase mb-1 tracking-widest">Metadata Integration</p>
                <p className="text-sm font-black text-white/80">Updating this unit affects its child chapters and lessons.</p>
            </div>
            <button 
                onClick={() => router.push("/admin/explorer")}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
            >
                OPEN TREE VIEW
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
