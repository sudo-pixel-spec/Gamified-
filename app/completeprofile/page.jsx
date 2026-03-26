"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { apiFetch, getToken, restoreSession } from "../../lib/api";

// ── tiny helpers ────────────────────────────────────────────────────────────
function Badge({ ok }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-600/40">
      Not linked
    </span>
  );
}

function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = (value || "      ").split("").slice(0, 6);

  function handleKey(i, e) {
    if (e.key === "Backspace") {
      const next = digits.map((d, idx) => (idx === i ? " " : d)).join("");
      onChange(next.trimEnd());
      if (i > 0) refs.current[i - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = digits.map((d, idx) => (idx === i ? e.key : d)).join("");
      onChange(next);
      if (i < 5) refs.current[i + 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {[0,1,2,3,4,5].map(i => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={() => {}}
          onKeyDown={e => handleKey(i, e)}
          className="w-10 h-12 text-center text-lg font-bold bg-white/5 border border-white/15 rounded-lg text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
        />
      ))}
    </div>
  );
}

// ── contact-link panel ───────────────────────────────────────────────────────
function LinkContactPanel({ type, existing, onLinked }) {
  // type = "email" | "phone"
  const [step, setStep] = useState("idle"); // idle | input | otp | done
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  if (existing) {
    return (
      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/3 border border-white/8">
        <div className="flex items-center gap-3">
          <ContactIcon type={type} />
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{type}</p>
            <p className="text-sm text-slate-200 font-medium">{existing}</p>
          </div>
        </div>
        <Badge ok />
      </div>
    );
  }

  async function sendOtp() {
    setError("");
    if (!value.trim()) return setError(`Enter a valid ${type}`);
    setLoading(true);
    try {
      // TODO: wire to your actual endpoint
      // POST /v1/me/link-contact/send-otp  { type, value }
      await apiFetch("/v1/me/link-contact/send-otp", {
        method: "POST",
        body: JSON.stringify({ type, value: value.trim() }),
      });
      setStep("otp");
      setTimer(60);
    } catch (e) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError("");
    if ((otp.replace(/\s/g, "")).length < 6) return setError("Enter the 6-digit code");
    setLoading(true);
    try {
      // TODO: wire to your actual endpoint
      // POST /v1/me/link-contact/verify-otp  { type, value, otp }
      await apiFetch("/v1/me/link-contact/verify-otp", {
        method: "POST",
        body: JSON.stringify({ type, value: value.trim(), otp: otp.replace(/\s/g, "") }),
      });
      setStep("done");
      onLinked(value.trim());
    } catch (e) {
      setError(e.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
      {/* header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <ContactIcon type={type} />
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{type}</p>
            <p className="text-sm text-slate-400">Not linked</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge ok={false} />
          {step === "idle" && (
            <button
              onClick={() => setStep("input")}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 transition-all"
            >
              + Add
            </button>
          )}
        </div>
      </div>

      {/* input step */}
      {step === "input" && (
        <div className="border-t border-white/8 px-4 py-4 space-y-3">
          <input
            type={type === "email" ? "email" : "tel"}
            placeholder={type === "email" ? "you@example.com" : "+91 98765 43210"}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendOtp()}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary outline-none text-sm"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setStep("idle"); setError(""); setValue(""); }}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-background-dark font-bold text-sm transition-all disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </div>
        </div>
      )}

      {/* otp step */}
      {step === "otp" && (
        <div className="border-t border-white/8 px-4 py-4 space-y-4">
          <p className="text-xs text-slate-400 text-center">
            Code sent to <span className="text-slate-200 font-medium">{value}</span>
          </p>
          <OtpInput value={otp} onChange={setOtp} />
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-background-dark font-bold text-sm transition-all disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & Link"}
          </button>
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-xs text-slate-500">Resend in {timer}s</p>
            ) : (
              <button
                onClick={sendOtp}
                className="text-xs text-primary hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="border-t border-white/8 px-4 py-3">
          <p className="text-xs text-emerald-400 text-center font-medium">
            ✓ {type === "email" ? "Email" : "Phone"} linked successfully
          </p>
        </div>
      )}
    </div>
  );
}

function ContactIcon({ type }) {
  if (type === "email") return (
    <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    </div>
  );
  return (
    <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="4" y="1" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="8" cy="12" r="0.8" fill="currentColor"/>
      </svg>
    </div>
  );
}

// ── main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // editable fields
  const [fullName, setFullName] = useState("");
  const [nameChanged, setNameChanged] = useState(false);

  // save state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    async function load() {
      // Step 1: paint from cache instantly — zero wait
      try {
        const cached = localStorage.getItem("userProfile");
        if (cached) {
          const u = JSON.parse(cached);
          setUser(u);
          setFullName(u?.profile?.fullName ?? "");
          setLoadingUser(false);
        }
      } catch {}

      // Step 2: ensure token exists without an extra round-trip if already valid
      if (!getToken()) {
        const restored = await restoreSession();
        if (!restored) {
          window.location.href = "/login";
          return;
        }
      }

      // Step 3: fetch fresh profile in background (apiFetch auto-refreshes on 401)
      try {
        const data = await apiFetch("/v1/me");
        const u = data?.data ?? data;
        setUser(u);
        setFullName(u?.profile?.fullName ?? "");
        try { localStorage.setItem("userProfile", JSON.stringify(u)); } catch {}
      } catch {}
      finally {
        setLoadingUser(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await apiFetch("/v1/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          standard: user?.profile?.standard ?? "CBSE_STD_8",
          timezone: user?.profile?.timezone ?? "Asia/Kolkata",
        }),
      });
      setSaveSuccess(true);
      setNameChanged(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setSaveError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleLinked(type, value) {
    setUser(prev => ({ ...prev, [type]: value }));
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-500 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  const avatar = user?.profile?.avatarUrl;
  const initials = (user?.profile?.fullName || user?.email || user?.phone || "?")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const authMethod = user?.authProvider === "google" ? "Google" : "Phone OTP";

  return (
    <div className="min-h-screen bg-background-dark px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">

        {/* ── header ── */}
        <div className="flex items-center gap-4 mb-2">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
            {avatar
              ? <Image src={avatar} alt="avatar" fill className="object-cover" />
              : <span className="text-xl font-bold text-slate-300">{initials}</span>
            }
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              {user?.profile?.fullName || "Your Profile"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Signed in via {authMethod}
              {user?.profile?.standard && (
                <> · <span className="text-slate-400">{user.profile.standard.replace("CBSE_STD_", "CBSE Std ")}</span></>
              )}
            </p>
          </div>
        </div>

        {/* ── basic info card ── */}
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Basic Info</h2>

          {/* name */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => { setFullName(e.target.value); setNameChanged(true); setSaveSuccess(false); }}
              placeholder="Your full name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* standard — locked */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Standard</label>
            <div className="w-full bg-white/3 border border-white/6 rounded-xl px-4 py-3 text-slate-500 text-sm flex items-center justify-between">
              <span>
                {user?.profile?.standard
                  ? user.profile.standard.replace("CBSE_STD_", "CBSE — Standard ")
                  : "Not set"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-600 border border-white/8">Locked</span>
            </div>
          </div>

          {/* timezone — locked */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Timezone</label>
            <div className="w-full bg-white/3 border border-white/6 rounded-xl px-4 py-3 text-slate-500 text-sm flex items-center justify-between">
              <span>{user?.profile?.timezone ?? "Asia/Kolkata"}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-600 border border-white/8">Locked</span>
            </div>
          </div>

          {/* save feedback */}
          {saveError && (
            <p className="text-xs text-red-400 px-1">{saveError}</p>
          )}

          {/* save button — only show when name changed */}
          <div className={`transition-all duration-300 overflow-hidden ${nameChanged ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
            <button
              onClick={handleSave}
              disabled={saving || !fullName.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {saveSuccess && (
            <p className="text-xs text-emerald-400 text-center animate-pulse">✓ Profile updated</p>
          )}
        </div>

        {/* ── linked accounts card ── */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Linked Accounts</h2>
            <p className="text-xs text-slate-600 mt-1">Link both email and phone to secure your account.</p>
          </div>

          <LinkContactPanel
            type="email"
            existing={user?.email ?? null}
            onLinked={v => handleLinked("email", v)}
          />
          <LinkContactPanel
            type="phone"
            existing={user?.phone ?? null}
            onLinked={v => handleLinked("phone", v)}
          />
        </div>

        {/* ── account stats (read-only) ── */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Account</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "XP", value: user?.totalXP ?? 0 },
              { label: "Level", value: user?.level ?? 1 },
              { label: "Streak", value: `${user?.streakCount ?? 0}🔥` },
            ].map(stat => (
              <div key={stat.label} className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-slate-100">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}