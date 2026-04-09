"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { getToken, apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { fetchAllStudentStandards } from "../../lib/curriculum-api";

const API = process.env.NEXT_PUBLIC_API_URL || "";



export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, refreshUser } = useAuth();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Grade/Standard selection state
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [availableGrades, setAvailableGrades] = useState([]);
  const [savingGrade, setSavingGrade] = useState(false);
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

  // Verification state
  const [verifyingField, setVerifyingField] = useState(null); // 'phone' | 'email' | null
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [verifyValue, setVerifyValue] = useState(""); // The phone/email being verified
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const fetchMe = async (token) => {
    try {
      const response = await apiFetch("/v1/me");
      const data = response?.data || response;
      setMe(data);
      setEditName(data?.profile?.fullName || "");
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    const token = getToken();
    if (!token) return;
    fetchMe(token);

    // Fetch ALL available grades recursively with zero filtering
    fetchAllStudentStandards()
      .then(list => {
        setAvailableGrades(list || []); 
      })
      .catch(console.error);
  }, [authLoading]);

  const handleSaveName = async () => {
    if (!editName.trim() || editName === me?.profile?.fullName) {
      setIsEditingName(false);
      return;
    }
    const token = getToken();
    setSavingName(true);
    try {
      // For name updates, we use the onboarding route to stay safe with the dynamic "standard" value 
      // if it was already set to an ID.
      await apiFetch("/v1/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({ 
          fullName: editName.trim(),
          standard: me?.profile?.standard || "",
          timezone: me?.profile?.timezone || "Asia/Kolkata"
        }),
      });
      await refreshUser();
      await fetchMe(token);
      setIsEditingName(false);
    } catch (err) {
      alert("Failed to update name: " + err.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!selectedGradeId || selectedGradeId === me?.profile?.standard) {
      setIsEditingGrade(false);
      return;
    }
    const token = getToken();
    setSavingGrade(true);
    try {
      // Use the flexible Onboarding route to save the grade ID
      await apiFetch("/v1/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({ 
          fullName: me?.profile?.fullName || "Learner",
          standard: selectedGradeId,
          timezone: me?.profile?.timezone || "Asia/Kolkata"
        }),
      });
      
      await refreshUser();
      await fetchMe(token);
      setIsEditingGrade(false);
      alert("Grade updated successfully!");
    } catch (err) {
      alert("Failed to update grade: " + err.message);
    } finally {
      setSavingGrade(false);
    }
  };

  const handleStartVerify = async (type, value) => {
    setVerifyingField(type);
    setVerifyValue(value);
    setVerifyLoading(true);
    setVerifyError("");
    setOtpStep(false);
    setOtpValue("");
    try {
      // POST /v1/auth/request-otp
      await apiFetch("/v1/auth/request-otp", {
        method: "POST",
        body: JSON.stringify(type === "phone" ? { phone: value } : { email: value }),
      });
      setOtpStep(true);
    } catch (err) {
      setVerifyError("Failed to send OTP: " + err.message);
      setVerifyingField(null);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length < 4) return;
    setVerifyLoading(true);
    setVerifyError("");
    const token = getToken();
    try {
      // We assume the OTP is verified using PATCH /v1/me/profile with the OTP or via an auth endpoint
      // Using a standard flow: /v1/auth/verify-otp would return tokens, but we are logged in.
      // Many APIs allow passing the OTP to the profile update or a specific verify endpoint.
      // E.g. POST /v1/auth/verify-otp with phone and otp.
      await apiFetch("/v1/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(verifyingField === "phone" 
          ? { phone: verifyValue, otp: otpValue }
          : { email: verifyValue, otp: otpValue })
      });
      
      await refreshUser();
      await fetchMe(token);
      setVerifyingField(null);
      setOtpStep(false);
      alert(`${verifyingField === "phone" ? "Phone" : "Email"} verified successfully!`);
    } catch (err) {
      setVerifyError("Invalid OTP: " + err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!me) {
    return (
      <div className="text-center py-20 text-slate-500">Failed to load profile.</div>
    );
  }

  const p = me?.profile || {};
  const isEmailAuth = !!me.email && !me.phone;
  const isPhoneAuth = !!me.phone && !me.email;
  
  // Decide what button to show for verification based on requirements
  // "If user signed up via email (email set, phone not verified), show Verify Phone Number"
  const needsPhoneVerification = isEmailAuth || (p.phone && !me.phoneVerified);
  const needsEmailVerification = isPhoneAuth || (p.email && !me.emailVerified);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-500 hover:text-primary">
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1 className="text-3xl font-display font-bold">Your Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Level */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full ring-4 ring-primary/20 bg-slate-100 dark:bg-card-dark flex items-center justify-center overflow-hidden shadow-xl">
            {p.avatarUrl ? (
              <img src={p.avatarUrl} alt="Avatar" width={128} height={128} loading="eager" fetchPriority="high" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName ? p.fullName.split(" ")[0] : "Learner")}&background=F97316&color=fff&size=256`} alt="Default Avatar" width={128} height={128} loading="eager" fetchPriority="high" referrerPolicy="no-referrer" className="w-full h-full object-cover bg-primary/10" />
            )}
          </div>
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full uppercase tracking-widest mb-2">Level {me.level || 1}</span>
            <div className="flex items-center justify-center gap-4 text-sm font-bold mt-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <span className="material-symbols-rounded">bolt</span> {me.totalXP || 0} XP
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <span className="material-symbols-rounded">paid</span> {me.wallet?.coins || 0}
              </div>
            </div>

            {/* System Metadata - ID for debugging/targeting */}
            <div className="mt-8 pt-6 border-t border-dashed border-slate-200 dark:border-white/10 opacity-70">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block font-display">System Identification</label>
                <div className="flex items-center gap-2 bg-black/5 dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-rounded text-slate-400 text-sm">fingerprint</span>
                    <code className="text-[11px] font-mono font-bold text-slate-500 break-all select-all flex-1">{me?._id || me?.id || "N/A"}</code>
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight italic">Use this unique ID in Mission Control for targeted transmissions.</p>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card dark:bg-card-dark border border-slate-200 dark:border-white/10 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-display">Personal Details</h2>
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${me.profileComplete ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {me.profileComplete ? "Onboarded" : "Setup Incomplete"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <button 
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="bg-primary text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
                    >
                      {savingName ? "..." : "Save"}
                    </button>
                    <button 
                      onClick={() => { setIsEditingName(false); setEditName(p.fullName); }}
                      className="bg-slate-100 dark:bg-white/5 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-medium text-lg">{p.fullName || "Not set"}</span>
                    <button onClick={() => setIsEditingName(true)} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                      <span className="material-symbols-rounded text-sm">edit</span> Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-medium">{me.email || p.email || "Not set"}</span>
                  {needsEmailVerification && (p.email || me.email) && !verifyingField && (
                    <button onClick={() => handleStartVerify("email", me.email || p.email)} className="text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-md hover:bg-primary/20">
                      Verify Email
                    </button>
                  )}
                  {(me.emailVerified || (!needsEmailVerification && me.email)) && (
                    <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><span className="material-symbols-rounded !text-[14px]">check_circle</span> Verified</span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-medium">{me.phone || p.phone || "Not set"}</span>
                  {needsPhoneVerification && !verifyingField && (
                    <button 
                      onClick={() => handleStartVerify("phone", prompt("Enter your phone number (e.g., +91...):", me.phone || p.phone || ""))} 
                      className="text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-md hover:bg-primary/20"
                    >
                      Verify Phone
                    </button>
                  )}
                  {(me.phoneVerified || (!needsPhoneVerification && me.phone)) && (
                    <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><span className="material-symbols-rounded !text-[14px]">check_circle</span> Verified</span>
                  )}
                </div>
              </div>

              {/* Grade / Standard */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grade / Standard</label>
                {isEditingGrade ? (
                  <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 relative" data-grade-select="true">
                    <button 
                      onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
                      className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <span className="truncate">
                        {availableGrades.find(g => g._id === selectedGradeId)?.name || "Select your grade"}
                      </span>
                      <span className={`material-symbols-rounded transition-transform ${isGradeDropdownOpen ? 'rotate-180 text-primary' : 'text-slate-400'}`}>
                        expand_more
                      </span>
                    </button>

                    {isGradeDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                        <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-sm">search</span>
                            <input 
                              type="text"
                              placeholder="Find your grade..."
                              value={gradeSearchQuery}
                              onChange={(e) => setGradeSearchQuery(e.target.value)}
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1 customize-scrollbar flex flex-col gap-0.5">
                          {availableGrades
                            .filter(g => 
                               (g.name || "").toLowerCase().includes(gradeSearchQuery.toLowerCase()) || 
                               (g.code || "").toLowerCase().includes(gradeSearchQuery.toLowerCase())
                            )
                            .map(g => (
                              <button 
                                key={g._id}
                                onClick={() => { setSelectedGradeId(g._id); setIsGradeDropdownOpen(false); setGradeSearchQuery(''); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${g._id === selectedGradeId ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-col">
                                    <span className="text-[9px] opacity-50 font-mono">{g.code}</span>
                                    <span>{g.name}</span>
                                  </div>
                                  {g._id === selectedGradeId && <span className="material-symbols-rounded text-sm">check</span>}
                                </div>
                              </button>
                            ))
                          }
                          {availableGrades.length === 0 && (
                            <p className="text-[10px] text-slate-400 text-center py-4 font-bold uppercase tracking-widest">No Grades Loaded</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                    <button 
                      onClick={handleSaveGrade}
                      disabled={savingGrade}
                      className="bg-primary text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
                    >
                      {savingGrade ? "..." : "Save"}
                    </button>
                    <button 
                      onClick={() => { setIsEditingGrade(false); setSelectedGradeId(me?.profile?.standard); }}
                      className="bg-slate-100 dark:bg-white/5 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <span className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-sm font-bold">
                      <span className="material-symbols-rounded text-slate-400">school</span>
                      {availableGrades.find(g => g._id === p.standard)?.name || p.standard || "Not set"}
                    </span>
                    <button onClick={() => { 
                      setIsEditingGrade(true); 
                      const current = availableGrades.find(g => g._id === p.standard || g.code === p.standard);
                      setSelectedGradeId(current?._id || p.standard); 
                    }} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                      <span className="material-symbols-rounded text-sm">edit</span> Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Timezone */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Timezone</label>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-sm font-bold">
                    <span className="material-symbols-rounded text-slate-400">schedule</span>
                    {p.timezone || "Not set"}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Verification UI Overlay/Inline */}
          {verifyingField && (
            <div className="glass-card bg-primary/5 border border-primary/20 p-6 rounded-2xl animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold font-display text-lg text-primary">Verify {verifyingField === "phone" ? "Phone" : "Email"}</h3>
                <button onClick={() => setVerifyingField(null)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-rounded">close</span></button>
              </div>
              
              {!otpStep ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-sm font-bold text-slate-500 tracking-widest uppercase text-[10px]">Sending OTP...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    We sent a code to <strong className="text-slate-800 dark:text-slate-200">{verifyValue}</strong>.
                  </p>
                  <input 
                    type="text" 
                    placeholder="Enter OTP"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-center tracking-[0.5em] font-mono text-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={6}
                    autoFocus
                  />
                  {verifyError && <p className="text-red-500 text-xs text-center font-bold">{verifyError}</p>}
                  <button 
                    onClick={handleVerifyOtp}
                    disabled={verifyLoading || otpValue.length < 4}
                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    {verifyLoading ? "Verifying..." : "Confirm Code"}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
