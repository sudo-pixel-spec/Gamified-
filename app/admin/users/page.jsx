"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { 
  listUsers, 
  createAdmin,
  listStandards
} from "../../../lib/admin-api";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth(["admin"]);
  const isSuper = user?.adminType === "super" || user?.role === "admin"; // Broaden for admin view

  const [learners, setLearners] = useState([]);
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ fullName: "", email: "", phone: "", allocatedStandards: [] });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, sRes] = await Promise.all([
        listUsers(), 
        listStandards()
      ]);
      setLearners(lRes?.data?.items ?? []);
      setStandards(sRes?.data?.items ?? []);
    } catch (err) {
      setError("System failure in user retrieval: " + (err.message || "Unknown sector error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createAdmin(newAdmin);
      setSuccess("Staff account successfully deployed to the hierarchy!");
      setNewAdmin({ fullName: "", email: "", phone: "", allocatedStandards: [] });
      setShowCreateAdmin(false);
      fetchData();
    } catch (err) {
      setError("Deployment failed: " + err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isSuper) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-rose-500/5 blur-[120px] pointer-events-none" />
        <span className="material-symbols-outlined text-7xl text-rose-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">lock_person</span>
        <h1 className="text-3xl font-display font-black text-white mb-3 uppercase italic tracking-tight">Access Restricted</h1>
        <p className="text-white/40 mb-8 max-w-sm leading-relaxed text-sm">Hierarchy governance is limited to Super Administrators. Your current clearance level is insufficient.</p>
        
        <div className="bg-[#141414]/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 mb-10 text-left min-w-[320px] shadow-2xl">
          <p className="text-[10px] font-black text-white/20 uppercase mb-4 tracking-[0.2em]">Auth Signature</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/40 font-bold uppercase tracking-widest">Sector Role</span>
              <span className="font-black text-emerald-400 px-2 py-0.5 bg-emerald-400/10 rounded border border-emerald-400/20 uppercase tracking-tighter">{user?.role || "GUEST"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/40 font-bold uppercase tracking-widest">Grade Type</span>
              <span className="font-black text-amber-400 px-2 py-0.5 bg-amber-400/10 rounded border border-amber-400/20 uppercase tracking-tighter">{user?.adminType || "LEARNER"}</span>
            </div>
          </div>
        </div>

        <Link href="/admin" className="px-10 py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all active:scale-95 shadow-xl">
          Return to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12 relative overflow-hidden selection:bg-primary/30">
      
      {/* ── Background Gradients ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 flex items-center justify-between p-4 lg:p-6 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-orange-500/10">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/60 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-display font-black tracking-tight flex items-center gap-2 uppercase italic">
               Staff Control <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20 not-italic font-mono group-hover:scale-110 transition-transform">SECURE_LEVEL_4</span>
            </h1>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-0.5">Hierarchy Governance Engine</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateAdmin(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Initialize Admin Access
        </button>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-4 lg:p-8 space-y-10">
        
        {(error || success) && (
          <div className={`p-5 rounded-2xl border ${error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-500`}>
             <div className="flex items-center gap-3">
               <span className="material-symbols-outlined">{error ? 'error' : 'verified'}</span>
               <p className="text-xs font-black uppercase tracking-widest">{error || success}</p>
             </div>
             <button onClick={() => { setError(""); setSuccess(""); }} className="material-symbols-outlined text-sm hover:rotate-90 transition-transform">close</button>
          </div>
        )}

        {/* System Info Banner */}
        <section className="relative group overflow-hidden bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 transition-all hover:border-primary/20">
          <div className="relative flex items-start gap-6">
            <div className="size-16 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform duration-500">
               <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <div>
              <h3 className="text-lg font-display font-black text-white mb-2 uppercase italic italic">Super Admin Protocols</h3>
              <p className="text-sm text-white/50 max-w-2xl leading-relaxed font-medium capitalize">
                provisioning of staff accounts requires hierarchical clearance. new accounts default to regular admin status with partitioned curriculum access based on allocated standards.
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-48 bg-gradient-to-l from-primary/5 to-transparent opacity-50" />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[
            { label: 'Staff Count', value: 'Active', icon: 'shield_person', color: 'text-blue-400' },
            { label: 'Learners', value: learners.length, icon: 'groups', color: 'text-emerald-400' },
            { label: 'Waitlist', value: '0', icon: 'hourglass_empty', color: 'text-amber-400' },
            { label: 'Restrictions', value: 'None', icon: 'block', color: 'text-rose-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#141414]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 lg:p-8 hover:border-primary/30 transition-all group shadow-xl">
              <div className={`p-2.5 rounded-xl bg-white/5 ${stat.color} inline-flex mb-4 group-hover:scale-110 transition-transform border border-white/5`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-2xl font-black text-white mt-1 italic font-display">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Learner List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-3">
             <div className="flex items-center gap-3">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.3)]"></div>
                <h2 className="text-xl font-display font-black text-white uppercase italic">Active Learners</h2>
             </div>
             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Sector Persistence Feed</span>
          </div>
          
          <div className="bg-[#141414]/60 backdrop-blur-xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/40 border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-white/40 tracking-widest">Learner Entity</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-white/40 tracking-widest text-center">Contact Matrix</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-white/40 tracking-widest text-center">Experience</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-white/40 tracking-widest text-right">Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {learners.map(learner => (
                    <tr key={learner.id} className="hover:bg-white/[0.03] group transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/10 border border-primary/20 flex items-center justify-center text-primary font-display font-black text-xl group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                            {(learner.fullName || "A")[0]}
                          </div>
                          <div>
                            <div className="font-black text-white text-sm tracking-tight">{learner.fullName || "Anonymous Learner"}</div>
                            <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mt-1">Joined {new Date(learner.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-white/60 font-mono">
                              <span className="material-symbols-outlined text-[14px]">mail</span>
                              {learner.email || "No Digital Sig"}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-white/30 font-mono">
                              <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
                              {learner.phone || "—"}
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" style={{ width: `${Math.min(100, (learner.level / 50) * 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">LVL {learner.level} CERTIFIED</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                          <span className="size-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
                          LEARNER
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* ── Create Admin Modal ── */}
      {showCreateAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowCreateAdmin(false)} />
          <div className="relative bg-[#0f0f0f] border border-orange-500/20 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(255,165,0,0.1)] animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-orange-600/5 to-transparent">
              <div>
                <h2 className="text-2xl font-display font-black text-white uppercase italic">Access Initialization</h2>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Staff Clearance Protocol</p>
              </div>
              <button 
                 onClick={() => setShowCreateAdmin(false)} 
                 className="size-12 rounded-2xl bg-white/5 hover:bg-rose-500 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all group active:scale-90"
              >
                 <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-3">Full Legal Identity</label>
                  <input 
                    type="text" required
                    placeholder="Enter full name"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary focus:bg-white/[0.08] outline-none transition-all placeholder:text-white/20 font-bold"
                    value={newAdmin.fullName}
                    onChange={e => setNewAdmin({...newAdmin, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-3">Transmission Channel (Phone)</label>
                  <input 
                    type="text"
                    placeholder="+91 00000 00000"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary focus:bg-white/[0.08] outline-none transition-all placeholder:text-white/20 font-mono font-bold"
                    value={newAdmin.phone}
                    onChange={e => setNewAdmin({...newAdmin, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-3">Primary Digital Node (Email)</label>
                <input 
                  type="email" required
                  placeholder="staff@mission.com"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary focus:bg-white/[0.08] outline-none transition-all placeholder:text-white/20 font-mono font-bold"
                  value={newAdmin.email}
                  onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-3">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Curriculum Partitioning</label>
                   <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Regular Admin Default</span>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 bg-black/40 rounded-[2rem] border border-white/5 max-h-48 overflow-y-auto no-scrollbar">
                  {standards.map(s => (
                    <label key={s._id || s.id} className={`flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/5 cursor-pointer group transition-all border border-transparent ${newAdmin.allocatedStandards.includes(s._id || s.id) ? 'border-primary/40 bg-primary/5' : ''}`}>
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox"
                          className="peer size-6 opacity-0 absolute cursor-pointer z-10"
                          checked={newAdmin.allocatedStandards.includes(s._id || s.id)}
                          onChange={e => {
                            const sid = s._id || s.id;
                            const list = e.target.checked 
                              ? [...newAdmin.allocatedStandards, sid]
                              : newAdmin.allocatedStandards.filter(id => id !== sid);
                            setNewAdmin({...newAdmin, allocatedStandards: list});
                          }}
                        />
                        <div className="size-6 rounded-lg border-2 border-white/10 peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                           <span className="material-symbols-outlined text-[16px] text-white opacity-0 peer-checked:opacity-100 transition-opacity font-black">check</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className={`text-[11px] font-black uppercase tracking-tight transition-colors truncate ${newAdmin.allocatedStandards.includes(s.id) ? 'text-primary' : 'text-white'}`}>{s.code}</div>
                        <div className="text-[9px] text-white/20 font-bold uppercase truncate">{s.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  className="w-full py-5 bg-primary text-white text-xs font-black rounded-2xl shadow-[0_15px_40px_-10px_rgba(255,165,0,0.4)] hover:bg-orange-600 hover:shadow-orange-500/60 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                  <span className="material-symbols-outlined text-[24px] group-hover:rotate-12 transition-transform">rocket_launch</span>
                  <span className="tracking-[0.2em] uppercase">Deploy Staff Identity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

