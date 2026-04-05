"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MOCK_LEARNERS = [
  { id: "1", fullName: "Yusuff Ali", email: "yusuff@example.com", phone: "+91 98765 43210", level: 12, joinDate: "2026-03-15T10:00:00Z" },
  { id: "2", fullName: "Sarah Connor", email: "sarah@sky.net", phone: "+1 555 1234", level: 8, joinDate: "2026-03-20T14:30:00Z" },
  { id: "3", fullName: "Bruce Wayne", email: "bruce@waynecorp.com", phone: "—", level: 25, joinDate: "2026-01-05T09:15:00Z" },
  { id: "4", fullName: "Diana Prince", email: "diana@themyscira.com", phone: "+30 210 123", level: 20, joinDate: "2026-02-12T11:45:00Z" },
  { id: "5", fullName: "Tony Stark", email: "tony@starkindustries.com", phone: "+1 212 555", level: 18, joinDate: "2026-03-01T16:20:00Z" },
];

const MOCK_STANDARDS = [
  { id: "std1", code: "Grade_8", name: "GRADE VIII" },
  { id: "std2", code: "Grade_9", name: "GRADE IX" },
  { id: "std3", code: "Grade_10", name: "GRADE X" },
  { id: "std4", code: "Computing_A", name: "Computing A" },
];

export default function SuperAdminPreviewPage() {
  const router = useRouter();
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ fullName: "", email: "", phone: "", allocatedStandards: [] });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 font-[family-name:var(--font-plus-jakarta-sans)] selection:bg-primary/30">
      {/* ── Background Gradients ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-orange-500/10">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/60 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
               Admin & Staff <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-md uppercase font-black border border-primary/20">Preview</span>
            </h1>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-0.5">Hierarchy Governance</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateAdmin(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-black rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Create New Admin
        </button>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto p-4 lg:p-8 space-y-10">
        
        {/* Info Banner */}
        <section className="relative group overflow-hidden bg-primary/5 border border-primary/20 rounded-2xl p-6 transition-all hover:bg-primary/10">
          <div className="relative flex items-start gap-5">
            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
               <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <div>
              <h3 className="text-base font-black text-white mb-1">Super Admin Privileges</h3>
              <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
                As a Super Administrator, you can deploy new admin accounts and partition curriculum access across standards. 
                Regular admins only see data for the standards you allocate to them.
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-primary/10 to-transparent opacity-50" />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Admins', value: '4', icon: 'shield_person', color: 'text-blue-400' },
            { label: 'Total Learners', value: '1,284', icon: 'groups', color: 'text-emerald-400' },
            { label: 'Waitlist', value: '12', icon: 'hourglass_empty', color: 'text-amber-400' },
            { label: 'Banned', value: '0', icon: 'block', color: 'text-rose-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl p-5 hover:border-primary/20 transition-all group">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color} inline-flex mb-3 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Learner Table Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <h2 className="text-lg font-black text-white">Registered Learners</h2>
               <span className="bg-white/5 text-white/40 text-[10px] px-2 py-1 rounded-md font-bold">{MOCK_LEARNERS.length} TOTAL</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="bg-[#141414] border border-white/5 rounded-lg px-3 py-1.5 flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px] text-white/30">search</span>
                 <input type="text" placeholder="Search users..." className="bg-transparent text-xs text-white outline-none w-32" />
               </div>
            </div>
          </div>
          
          <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/40 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-white/40 tracking-widest">Learner Entity</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-white/40 tracking-widest">Digital Contact</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-white/40 tracking-widest">Experience</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-white/40 tracking-widest text-right">Access Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_LEARNERS.map(learner => (
                    <tr key={learner.id} className="hover:bg-white/5 group transition-all">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center text-primary font-black group-hover:scale-110 transition-transform">
                            {learner.fullName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{learner.fullName}</div>
                            <div className="text-[10px] text-white/30 uppercase tracking-tighter mt-0.5 font-bold">Member Since {new Date(learner.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <span className="material-symbols-outlined text-[14px]">mail</span>
                              {learner.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
                              {learner.phone}
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col gap-1.5">
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500" style={{ width: `${(learner.level % 20) * 5}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Level {learner.level} Certified</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
                          <span className="size-1.5 rounded-full bg-white/20" />
                          Learner
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowCreateAdmin(false)} />
          <div className="relative bg-[#0f0f0f] border border-orange-500/30 rounded-[32px] w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(255,165,0,0.15)] animate-in fade-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-orange-600/5 to-transparent">
              <div>
                <h2 className="text-xl font-black text-white">Initialize Admin Access</h2>
                <p className="text-xs text-white/40 font-medium">Provision new accounts in the hierarchy</p>
              </div>
              <button 
                 onClick={() => setShowCreateAdmin(false)} 
                 className="size-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                 <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em] ml-1">Legal Full Name</label>
                  <input 
                    type="text" placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:border-primary focus:bg-white/[0.08] outline-none transition-all placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em] ml-1">Staff Phone</label>
                  <input 
                    type="text" placeholder="+91 00000 00000"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:border-primary focus:bg-white/[0.08] outline-none transition-all placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em] ml-1">Staff Primary Email</label>
                <input 
                  type="email" placeholder="staff@school.com"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:border-primary focus:bg-white/[0.08] outline-none transition-all placeholder:text-white/20"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em]">Privilege Allocation</label>
                   <span className="text-[10px] font-bold text-amber-500">Regular Admin Default</span>
                </div>
                <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 rounded-2xl border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                  {MOCK_STANDARDS.map(s => (
                    <label key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer group transition-all border border-transparent hover:border-primary/20">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox"
                          className="peer size-5 opacity-0 absolute cursor-pointer z-10"
                        />
                        <div className="size-5 rounded-md border-2 border-white/20 peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                           <span className="material-symbols-outlined text-[14px] text-white opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black text-white group-hover:text-primary transition-colors truncate">{s.code}</div>
                        <div className="text-[9px] text-white/40 font-bold uppercase truncate">{s.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="button"
                  className="w-full py-4 bg-primary text-white text-sm font-black rounded-2xl shadow-[0_10px_30px_rgba(255,165,0,0.2)] hover:bg-orange-600 hover:shadow-orange-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                  Deploy Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,165,0,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,165,0,0.4); }
      `}</style>
    </div>
  );
}
