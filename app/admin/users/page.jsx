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
  const isSuper = user?.adminType === "super";

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
        listUsers(), // Backend only returns learners
        listStandards()
      ]);
      setLearners(lRes?.data?.items ?? []);
      setStandards(sRes?.data?.items ?? []);
    } catch (err) {
      setError("Failed to load users: " + (err.message || "Unknown error"));
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
      setSuccess("Account created successfully!");
      setNewAdmin({ fullName: "", email: "", phone: "", allocatedStandards: [] });
      setShowCreateAdmin(false);
      fetchData();
    } catch (err) {
      setError("Creation failed: " + err.message);
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-center p-6">
        <span className="material-symbols-outlined text-6xl text-rose-500 mb-4">lock_person</span>
        <h1 className="text-2xl font-bold text-white mb-2">Super Admin Required</h1>
        <p className="text-white/50 mb-6">Access to manage other administrators is restricted to hierarchy leaders.</p>
        
        {/* Debug Info */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-4 mb-8 text-left min-w-[280px]">
          <p className="text-[10px] font-bold text-white/30 uppercase mb-2 tracking-widest">Your Current Auth State</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Role:</span>
              <span className="font-mono text-emerald-400">{user?.role || "null"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Admin Type:</span>
              <span className="font-mono text-amber-400">{user?.adminType || "null (learner/regular)"}</span>
            </div>
          </div>
        </div>

        <Link href="/admin" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-all">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <header className="flex items-center justify-between p-4 sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-orange-500/20">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Admin & User Control</h1>
        </div>
        <button 
          onClick={() => setShowCreateAdmin(true)}
          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors"
        >
          Create New Admin
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-8">
        {(error || success) && (
          <div className={`p-4 rounded-xl border ${error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} flex items-center justify-between animate-pulse`}>
            <p className="text-sm font-medium">{error || success}</p>
            <button onClick={() => { setError(""); setSuccess(""); }} className="material-symbols-outlined text-sm">close</button>
          </div>
        )}

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-4">
          <span className="material-symbols-outlined text-amber-500">info</span>
          <div>
            <h3 className="text-sm font-bold text-amber-500">Backend Restriction</h3>
            <p className="text-xs text-white/50 mt-1">
              Currently, the backend only supports **creating brand-new admin accounts**. 
              Promoting existing learners to admin is not supported via the API to maintain database integrity.
            </p>
          </div>
        </div>

        {/* Learner List */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-emerald-400">group</span>
            <h2 className="text-lg font-bold">Registered Learners</h2>
          </div>
          <div className="bg-[#141414] border border-orange-500/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 border-b border-orange-500/10">
                <tr>
                  <th className="px-4 py-3 font-bold text-white/50 text-[11px] uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 font-bold text-white/50 text-[11px] uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 font-bold text-white/50 text-[11px] uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 font-bold text-white/50 text-[11px] uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {learners.map(learner => (
                  <tr key={learner.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-white">{learner.fullName || "Anonymous"}</div>
                      <div className="text-[10px] text-white/30 tracking-tighter">Joined {new Date(learner.joinDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-4">
                       <div className="text-xs text-white/60">{learner.email || "No Email"}</div>
                       <div className="text-xs text-white/60">{learner.phone || "No Phone"}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase">Lvl {learner.level}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-[10px] font-bold uppercase text-white/20">Learner</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f0f] border border-orange-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-lg font-bold">Create New Admin Account</h2>
              <button onClick={() => setShowCreateAdmin(false)} className="material-symbols-outlined text-white/40 hover:text-white">close</button>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all"
                  value={newAdmin.fullName}
                  onChange={e => setNewAdmin({...newAdmin, fullName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase mb-1.5 ml-1">Email</label>
                  <input 
                    type="email"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all"
                    value={newAdmin.email}
                    onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase mb-1.5 ml-1">Phone</label>
                  <input 
                    type="text"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all"
                    value={newAdmin.phone}
                    onChange={e => setNewAdmin({...newAdmin, phone: e.target.value})}
                  />
                </div>
              </div>
              <p className="text-[10px] text-white/30 italic px-1">* New admins default to "Regular" type. Use Super Admin to manage curriculum.</p>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase mb-1.5 ml-1">Assign Standards</label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto p-2 bg-black/40 rounded-xl border border-white/5">
                  {standards.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded bg-white/5 border-white/10 text-primary focus:ring-0 checked:bg-primary"
                        checked={newAdmin.allocatedStandards.includes(s.id)}
                        onChange={e => {
                          const list = e.target.checked 
                            ? [...newAdmin.allocatedStandards, s.id]
                            : newAdmin.allocatedStandards.filter(id => id !== s.id);
                          setNewAdmin({...newAdmin, allocatedStandards: list});
                        }}
                      />
                      <span className="text-xs text-white/60 group-hover:text-white transition-colors">{s.code}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-orange-600 transition-all active:scale-95 mt-4"
              >
                Launch Admin Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
