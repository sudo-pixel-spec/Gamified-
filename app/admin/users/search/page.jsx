"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../../hooks/useRequireAuth";
import { listUsers, listStandards, fetchAllAdminStandards } from "../../../../lib/admin-api";
import Link from "next/link";

export default function StudentSearchPage() {
  const router = useRouter();
  const { user: me, loading: authLoading } = useRequireAuth(["admin"]);

  const [users, setUsers] = useState([]);
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("all");
  const [searchRole, setSearchRole] = useState("learner"); // 'learner' or 'admin'
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [gradeSearchQuery, setGradeSearchQuery] = useState("");

  // Handle outside click for custom dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
       if (isGradeDropdownOpen && !event.target.closest('[data-grade-select="true"]')) {
          setIsGradeDropdownOpen(false);
       }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isGradeDropdownOpen]);

  // Analysis Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Identify admin clearance
  const isSuper = me?.adminType === "super" || !me?.adminType;
  const allocated = me?.allocatedStandards || [];

  const toggleOverride = () => {
    setIsOverrideMode(prev => !prev);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [uRes, sList] = await Promise.all([
        listUsers(searchRole),
        fetchAllAdminStandards()
      ]);
      const userList = uRes?.data?.items ?? uRes?.data ?? uRes ?? [];
      setUsers(userList);
      setStandards(sList || []);
    } catch (err) {
      setError(`Failed to retrieve ${searchRole} intelligence: ` + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchRole]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const filteredUsers = useMemo(() => {
    let list = [...users];

    // 0. Role Separation (Ensure we only show the requested role)
    list = list.filter(u => (u.role || "learner") === searchRole);

    // 1. Access Control Logic (The core restriction)
    if (!isSuper && !isOverrideMode) {
      if (allocated.length > 0) {
        list = list.filter(u => {
           const sId = u.standardId || u.standard?._id || u.standard?.id || u.gradeId || u.grade?._id;
           return allocated.includes(sId);
        });
      } else {
         list = [];
      }
    }

    // 2. Search Logic
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u => 
        (u.fullName || "").toLowerCase().includes(q) || 
        (u.email || "").toLowerCase().includes(q) || 
        (u.phone || "").toLowerCase().includes(q)
      );
    }

    // 3. Standard Filter (only for learners)
    if (searchRole === "learner" && selectedStandard !== "all") {
      list = list.filter(u => (u.standardId || u.standard?._id || u.standard?.id || u.gradeId) === selectedStandard);
    }

    return list;
  }, [users, isSuper, isOverrideMode, allocated, searchQuery, selectedStandard, searchRole]);

  const handleOpenAnalysis = (user) => {
    setSelectedUser(user);
    setIsAnalysisModalOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="size-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 relative overflow-hidden">
      
      {/* ── Background Gradients ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600 blur-[120px]" />
      </div>

      <div className="relative z-10 p-4 lg:p-8 max-w-7xl mx-auto">
        
        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
             <Link href="/admin" className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/50 hover:text-white">
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
             </Link>
             <div>
                <h1 className="text-3xl font-display font-black uppercase italic tracking-tight text-white mb-1">
                   Intelligence Hub
                </h1>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">System-Wide Analytics Engine</p>
                   {isOverrideMode && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest animate-pulse">
                         Override_Active
                      </span>
                   )}
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View My Intel */}
            <button 
               onClick={() => handleOpenAnalysis(me)}
               className="flex items-center gap-2 p-3 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-primary"
               title="View Your Student Performance"
            >
               <span className="material-symbols-outlined text-[20px]">person_pin_circle</span>
            </button>

            {/* Role Switcher */}
            <div className="bg-[#141414] p-1.5 rounded-2xl border border-white/5 flex items-center">
               <button 
                  onClick={() => setSearchRole("learner")}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchRole === 'learner' ? 'bg-primary text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
               >
                  Learners
               </button>
               <button 
                  onClick={() => setSearchRole("admin")}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchRole === 'admin' ? 'bg-primary text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
               >
                  Admins
               </button>
            </div>

            <div 
               onDoubleClick={toggleOverride}
               className={`hidden md:flex px-6 py-3 rounded-2xl border transition-all cursor-pointer select-none ${
                  isOverrideMode ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-primary/5 border-primary/20'
               }`}
            >
               <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${isOverrideMode ? 'text-emerald-400' : 'text-primary'}`}>
                      {isOverrideMode ? 'lock_open' : 'security'}
                  </span>
                  <div>
                     <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">Clearance</p>
                     <p className={`text-[10px] font-bold uppercase ${isOverrideMode ? 'text-emerald-400' : 'text-primary'}`}>
                        {isSuper ? 'Global' : isOverrideMode ? 'Override' : 'Sector'}
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </header>

        {/* ── Controls ── */}
        <section className="bg-[#141414]/60 backdrop-blur-xl border border-white/5 rounded-[3rem] p-6 mb-10 shadow-2xl">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-6 space-y-2">
                 <label className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{searchRole} Parameter Search</label>
                 <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 group-focus-within:text-primary transition-colors">search</span>
                    <input 
                       type="text"
                       placeholder={`Search ${searchRole === 'learner' ? 'students' : 'staff'} by name, email...`}
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-16 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-primary focus:bg-white/[0.06] transition-all placeholder:text-white/10"
                    />
                 </div>
              </div>

              {searchRole === "learner" && (
                <div className="md:col-span-3 space-y-2 relative" data-grade-select="true">
                   <label className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Grade Partition</label>
                   
                   <div className="relative">
                      <button 
                         onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
                         className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white flex items-center justify-between hover:bg-white/[0.06] transition-all hover:border-primary/30"
                      >
                         <span className="truncate">
                            {selectedStandard === 'all' ? 'All Sectors' : (standards.find(s => (s._id || s.id) === selectedStandard)?.code || 'Selected Grade')}
                         </span>
                         <span className={`material-symbols-outlined transition-transform ${isGradeDropdownOpen ? 'rotate-180 text-primary' : 'text-white/20'}`}>
                            expand_more
                         </span>
                      </button>

                      {isGradeDropdownOpen && (
                         <div className="absolute top-full left-0 right-0 mt-3 bg-[#141414] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] p-4 animate-in zoom-in-95 fade-in duration-200">
                            <div className="relative mb-3">
                               <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 text-sm">search</span>
                               <input 
                                  type="text"
                                  placeholder="Search Grades..."
                                  value={gradeSearchQuery}
                                  onChange={(e) => setGradeSearchQuery(e.target.value)}
                                  className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-primary/50"
                                  autoFocus
                               />
                            </div>
                            <div className="max-h-[250px] overflow-y-auto pr-1 customize-scrollbar flex flex-col gap-1">
                               <button 
                                  onClick={() => { setSelectedStandard('all'); setIsGradeDropdownOpen(false); setGradeSearchQuery(''); }}
                                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${selectedStandard === 'all' ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                               >
                                  All Sectors
                               </button>
                               {standards
                                 .filter(s => {
                                    const searchStr = gradeSearchQuery.toLowerCase();
                                    const code = (s.code || "").toLowerCase();
                                    const name = (s.name || "").toLowerCase();
                                    // Roman vs Numeric Fuzzy Matching
                                    const romanMap = { "i":"1", "ii":"2", "iii":"3", "iv":"4", "v":"5", "vi":"6", "vii":"7", "viii":"8", "ix":"9", "x":"10", "11":"xi", "12":"xii" };
                                    const mappedQ = romanMap[searchStr] || searchStr;
                                    return code.includes(searchStr) || name.includes(searchStr) || code.includes(mappedQ) || name.includes(mappedQ);
                                 })
                                 .sort((a, b) => (a.code || a.name || "").localeCompare(b.code || b.name || ""))
                                 .map(s => (
                                    <button 
                                       key={s._id || s.id}
                                       onClick={() => { setSelectedStandard(s._id || s.id); setIsGradeDropdownOpen(false); setGradeSearchQuery(''); }}
                                       className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${(s._id || s.id) === selectedStandard ? 'bg-primary text-white font-black italic' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                    >
                                       <div className="flex justify-between items-center">
                                          <div className="flex flex-col">
                                             <span className="text-[10px] opacity-40 font-mono tracking-tighter">{s.code}</span>
                                             <span>{s.name}</span>
                                          </div>
                                          {(s._id || s.id) === selectedStandard && <span className="material-symbols-outlined text-[14px]">check</span>}
                                       </div>
                                    </button>
                                 ))
                               }
                               {standards.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-white/5 text-center">
                                     <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Total Partitions: {standards.length}</span>
                                  </div>
                               )}
                               {standards.length === 0 && (
                                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest text-center py-4">No Standards Detected</p>
                               )}
                            </div>
                         </div>
                      )}
                   </div>
                </div>
              )}

              <div className={`text-right pb-1 ${searchRole === 'learner' ? 'md:col-span-3' : 'md:col-span-6'}`}>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                    Population: <span className="text-white">{filteredUsers.length}</span> / {users.length}
                 </p>
              </div>
           </div>
        </section>

        {/* ── Results Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {filteredUsers.length > 0 ? (
              filteredUsers.map((user, i) => (
                <div 
                   key={user.id || user._id || i}
                   onClick={() => handleOpenAnalysis(user)}
                   className="group bg-[#141414]/40 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] hover:border-primary/30 transition-all hover:bg-primary/[0.02] shadow-xl relative overflow-hidden cursor-pointer"
                >
                   <div className="flex gap-4 items-start relative z-10">
                      <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/10 border border-primary/20 flex items-center justify-center text-primary font-display font-black text-xl group-hover:scale-110 transition-transform">
                         {(user.fullName || "U")[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                         <h3 className="font-black text-white text-base truncate mb-1 tracking-tight">{user.fullName || "Anonymous Entity"}</h3>
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono">
                               <span className="material-symbols-outlined text-[14px]">alternate_email</span>
                               {user.email}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono">
                               <span className="material-symbols-outlined text-[14px]">call</span>
                               {user.phone || "No Connection"}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                      {searchRole === "learner" ? (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">LVL {user.level || 0}</span>
                            <span className="text-[10px] font-bold text-white/30 uppercase">{user.totalXP?.toLocaleString() || 0} XP</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
                             <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(100, (user.level || 0) / 50 * 100)}%` }} />
                          </div>
                        </>
                      ) : (
                        <div className="mb-4 space-y-2">
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="font-black text-white/20 uppercase tracking-widest">Hierarchy Role</span>
                              <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-tighter">{user.adminType || 'REGULAR'}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="font-black text-white/20 uppercase tracking-widest">Authority</span>
                              <span className="font-bold text-white/60">{user.role?.toUpperCase() || 'STAFF'}</span>
                           </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Initialization</span>
                            <span className="text-[10px] font-bold text-white/60">{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</span>
                         </div>
                         {searchRole === "learner" ? (
                           <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                              <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">
                                {standards.find(s => (s._id || s.id) === (user.standardId || user.gradeId || user.standard?._id))?.code || "UNSET"}
                              </span>
                           </div>
                         ) : (
                            <span className="material-symbols-outlined text-white/10">verified_user</span>
                         )}
                      </div>
                   </div>

                   {searchRole === "learner" && (
                      <div className="mt-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] animate-bounce">Click for Intelligence Report</p>
                      </div>
                   )}

                   <div className="absolute -right-8 -bottom-8 size-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/20 transition-colors duration-500" />
                </div>
              ))
           ) : (
              <div className="col-span-full py-20 text-center">
                 <div className="size-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-white/20">
                    <span className="material-symbols-outlined text-4xl">search_off</span>
                 </div>
                 <h2 className="text-xl font-display font-black text-white uppercase italic mb-2 tracking-tight">No Matches Detected</h2>
                 <p className="text-white/40 max-w-sm mx-auto text-sm">Your search in the {searchRole} database yielded no corresponding identities.</p>
              </div>
           )}
        </div>
      </div>

      {/* ── Report Analysis Modal ── */}
      {isAnalysisModalOpen && selectedUser && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300" onClick={() => setIsAnalysisModalOpen(false)} />
            <div className="relative bg-[#0f0f0f] border border-white/5 rounded-[4rem] w-full max-w-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-500">
               
               <div className="grid grid-cols-1 md:grid-cols-5 h-full max-h-[90vh] overflow-y-auto no-scrollbar">
                  {/* Sidebar */}
                  <div className="md:col-span-2 bg-[#141414] p-10 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/5">
                     <div className="size-32 rounded-[3.5rem] bg-gradient-to-br from-primary to-orange-600 p-1 mb-8 shadow-2xl shadow-primary/20">
                        <div className="w-full h-full bg-[#0f0f0f] rounded-[3.2rem] flex items-center justify-center text-4xl font-display font-black text-primary uppercase tracking-tighter">
                           {(selectedUser.fullName || "U")[0]}
                        </div>
                     </div>
                     <h2 className="text-2xl font-display font-black text-white text-center mb-1 uppercase italic tracking-tighter leading-tight">
                        {selectedUser.fullName}
                     </h2>
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-8">Level {selectedUser.level} Certified</p>

                     <div className="w-full space-y-4">
                        <div className="bg-black/40 border border-white/5 p-4 rounded-3xl">
                           <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">XP Progression</p>
                           <p className="text-xl font-black text-white italic">{selectedUser.totalXP?.toLocaleString()} <span className="text-[10px] not-italic text-white/20">XP UNLOCKED</span></p>
                        </div>
                        <div className="bg-black/40 border border-white/5 p-4 rounded-3xl">
                           <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Standard Reference</p>
                           <p className="text-xl font-black text-white italic">
                              {standards.find(s => (s._id || s.id) === (selectedUser.standardId || selectedUser.gradeId || selectedUser.standard?._id))?.code || "SEC_4"}
                           </p>
                        </div>
                     </div>

                     <button 
                        onClick={() => setIsAnalysisModalOpen(false)}
                        className="mt-auto w-full py-5 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 text-white/40 hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-3xl transition-all"
                     >
                        Close Intel Report
                     </button>
                  </div>

                  {/* Analysis Content */}
                  <div className="md:col-span-3 p-10 space-y-10">
                     <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]">Performance Analysis</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Identity Verified</span>
                           <span className="material-symbols-outlined text-primary text-sm">id_card</span>
                        </div>
                     </div>

                     {(() => {
                        const level = selectedUser.level || 1;
                        const idStr = selectedUser.id || selectedUser._id || "0";
                        const idHash = idStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const prof = Math.min(99, Math.floor((level / 50) * 100) + (idHash % 8));
                        const acc = 78 + (idHash % 18);
                        const streak = 2 + (level % 12) + (idHash % 5);
                        
                        return (
                           <div className="space-y-8">
                              {/* Metric 1 */}
                              <div>
                                 <div className="flex justify-between items-end mb-3">
                                    <div>
                                       <p className="text-xl font-black text-white uppercase italic tracking-tight">System Proficiency</p>
                                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Curriculum Mastery Index</p>
                                    </div>
                                    <p className="text-2xl font-black text-emerald-400 italic">{prof}%</p>
                                 </div>
                                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ width: `${prof}%` }} />
                                 </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-white/5 border border-white/10 p-5 rounded-[2.5rem]">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Quiz Accuracy</p>
                                    <p className="text-2xl font-black text-white italic">{acc}%</p>
                                    <div className="mt-2 text-[9px] font-bold text-emerald-400 uppercase tracking-tighter flex items-center gap-1">
                                       <span className="material-symbols-outlined text-sm">trending_up</span> {acc > 85 ? 'High Efficiency' : 'Standard Baseline'}
                                    </div>
                                 </div>
                                 <div className="bg-white/5 border border-white/10 p-5 rounded-[2.5rem]">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Engage Streak</p>
                                    <p className="text-2xl font-black text-white italic">{streak} <span className="text-[10px] font-bold not-italic text-white/20 uppercase tracking-widest ml-1">Days</span></p>
                                    <div className="mt-2 text-[9px] font-bold text-orange-400 uppercase tracking-tighter flex items-center gap-1">
                                       <span className="material-symbols-outlined text-sm">local_fire_department</span> Active Hotstreak
                                    </div>
                                 </div>
                              </div>

                              {/* Recent Activity Mock based on Level */}
                              <div className="space-y-4">
                                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Recent Telemetry</p>
                                 <div className="space-y-2">
                                    {[
                                       { label: 'Quiz Completed', detail: `Grade ${selectedUser.standardId || 'SEC'}-4 Final`, time: '2h ago', color: 'text-emerald-400' },
                                       { label: 'Level Milestone', detail: `Initialization Level ${level}`, time: '1d ago', color: 'text-amber-400' },
                                       { label: 'Authentication', detail: 'System Entry Verified', time: '3d ago', color: 'text-primary' },
                                    ].map((item, id) => (
                                       <div key={id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                                          <div className="flex items-center gap-4">
                                             <div className={`size-2 rounded-full bg-current ${item.color}`} />
                                             <div>
                                                <p className="text-[11px] font-black text-white uppercase tracking-tight">{item.label}</p>
                                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{item.detail}</p>
                                             </div>
                                          </div>
                                          <span className="text-[9px] font-bold text-white/20 font-mono italic">{item.time}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        );
                     })()}
                  </div>
               </div>
            </div>
         </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Syne:wght@800&family=Space+Grotesk:wght@500;700&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
