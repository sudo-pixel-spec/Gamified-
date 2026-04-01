"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { getToken, apiFetch } from "../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "";

// Custom fetch for non-GET requests if apiFetch doesn't support them easily
async function mutate(path, { method = "POST", token, body }) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error?.message || json?.error || "Request failed");
  }
  return json?.data ?? json;
}

export default function ProfilePage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();

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

    // Fetch available grades for selection
    apiFetch("/v1/curriculum/standards")
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setAvailableGrades(list.filter(s => s.active !== false));
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
      await mutate("/v1/me/onboarding", {
        method: "PATCH",
        token,
        body: { 
          fullName: editName.trim(),
          standard: me?.profile?.standard || "",
          timezone: me?.profile?.timezone || "Asia/Kolkata"
        },
      });
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
      await mutate("/v1/me/onboarding", {
        method: "PATCH",
        token,
        body: { 
          fullName: me?.profile?.fullName || "Learner",
          standard: selectedGradeId,
          timezone: me?.profile?.timezone || "Asia/Kolkata"
        },
      });
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
      await mutate("/v1/auth/request-otp", {
        method: "POST",
        body: type === "phone" ? { phone: value } : { email: value },
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
      await mutate("/v1/auth/verify-otp", {
        method: "POST",
        body: verifyingField === "phone" 
          ? { phone: verifyValue, otp: otpValue }
          : { email: verifyValue, otp: otpValue }
      });
      
      // Attempt to patch to ensure it's marked
      try {
        await mutate("/v1/me/profile", {
          method: "PATCH",
          token,
          body: { [verifyingField]: verifyValue }
        });
      } catch (e) {
        // Might fail if it's already updated by verify-otp
      }

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
                    <select 
                      value={selectedGradeId}
                      onChange={(e) => setSelectedGradeId(e.target.value)}
                      className="flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>Select your grade</option>
                      {availableGrades.map(g => (
                        <option key={g._id} value={g._id}>{g.name} ({g.code})</option>
                      ))}
                    </select>
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
                    <button onClick={() => { setIsEditingGrade(true); setSelectedGradeId(p.standard); }} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
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
