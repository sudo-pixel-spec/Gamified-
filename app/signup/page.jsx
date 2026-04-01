"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setToken } from "../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";
const OTP_LENGTH = 6;

function formatPhoneDisplay(val) {
  const digits = val.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export default function SignUpPage() {
  const router = useRouter();

  const [step, setStep]             = useState("phone");
  const [phone, setPhone]           = useState("");
  const [digits, setDigits]         = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [resendCooldown, setResend] = useState(0);

  const digitRefs    = useRef([]);
  const googleBtnRef = useRef(null);
  const starsRef     = useRef(null);

  // ── star field ──────────────────────────────────────────────────────
  useEffect(() => {
    const c = starsRef.current;
    if (!c) return;
    c.innerHTML = "";
    for (let i = 0; i < 180; i++) {
      const s = document.createElement("span");
      const sz  = Math.random() * 2 + 0.5;
      const dur = (Math.random() * 4 + 2).toFixed(1);
      const del = (Math.random() * 6).toFixed(1);
      Object.assign(s.style, {
        position: "absolute",
        width: `${sz}px`, height: `${sz}px`,
        left: `${Math.random() * 100}%`,
        top:  `${Math.random() * 100}%`,
        borderRadius: "50%",
        background: "white",
        opacity: "0",
        animation: `twinkle ${dur}s ${del}s ease-in-out infinite`,
      });
      c.appendChild(s);
    }
  }, []);

  // ── resend cooldown ticker ───────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResend((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Google Identity Services ─────────────────────────────────────────
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const init = () => {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setLoading(true);
          setError("");
          try {
            const res = await fetch(`${API}/v1/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ credential: response.credential }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error?.message ?? "Google sign-up failed");
            const data = json?.data ?? json;
            setToken(data.accessToken);

            const user = data.user;
            if (user?.role === "admin" || user?.role === "super_admin") {
              router.push("/admin");
            } else {
              router.push(user?.profileComplete ? "/dashboard" : "/completeprofile");
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Google sign-up failed");
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard", theme: "filled_black", size: "large",
        text: "signup_with", shape: "pill", width: "260",
      });
    };
    if (window.google?.accounts) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = init;
      document.head.appendChild(script);
      return () => { document.head.removeChild(script); };
    }
  }, [router]);

  // ── shared OTP sender ────────────────────────────────────────────────
  const sendOtp = useCallback(async (phoneNum) => {
    const res = await fetch(`${API}/v1/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneNum }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message ?? "Failed to send OTP");
  }, []);

  // ── Step 1: request OTP ──────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    const raw = phone.replace(/\D/g, "");
    if (raw.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(raw);
      setStep("otp");
      setDigits(Array(OTP_LENGTH).fill(""));
      setResend(30);
      setTimeout(() => digitRefs.current[0]?.focus(), 80);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP — signup always goes to /completeprofile ──────
  const handleVerifyOtp = useCallback(async (otpValue) => {
    if (otpValue.length < OTP_LENGTH) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), otp: otpValue }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Invalid OTP");
      const data = json?.data ?? json;
      setToken(data.accessToken);

      const user = data.user;
      if (user?.role === "admin" || user?.role === "super_admin") {
        router.push("/admin");
      } else if (user?.profileComplete === true) {
        router.push("/dashboard");
      } else {
        router.push("/completeprofile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => digitRefs.current[0]?.focus(), 80);
    } finally {
      setLoading(false);
    }
  }, [phone, router]);

  // ── resend ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setLoading(true);
    try {
      await sendOtp(phone.replace(/\D/g, ""));
      setResend(30);
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => digitRefs.current[0]?.focus(), 80);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP digit handlers ───────────────────────────────────────────────
  const handleDigitChange = (i, val) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (char && i < OTP_LENGTH - 1) digitRefs.current[i + 1]?.focus();
    if (next.every(Boolean)) handleVerifyOtp(next.join(""));
  };

  const handleDigitKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) digitRefs.current[i - 1]?.focus();
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("").map((_, i) => pasted[i] ?? "");
    setDigits(next);
    digitRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    if (pasted.length === OTP_LENGTH) handleVerifyOtp(pasted);
  };

  const maskedPhone = `+91 ${phone.replace(/\D/g, "").slice(0, 5)} ${phone.replace(/\D/g, "").slice(5)}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --accent:#ff5c1a; --surface:rgba(255,255,255,0.04); --border:rgba(255,255,255,0.10);
          --border-focus:rgba(255,92,26,0.6); --text:#f0ede8; --text-muted:#7a7870;
          --bg:#0d0c0b; --font-display:'Syne',sans-serif; --font-body:'DM Sans',sans-serif; --radius:14px;
        }
        @keyframes twinkle { 0%,100%{opacity:0;transform:scale(1)} 50%{opacity:.85;transform:scale(1.3)} }
        @keyframes floatIn { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.55);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        html,body { height:100%; background:var(--bg); }
        .page { font-family:var(--font-body); color:var(--text); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; position:relative; overflow:hidden; background: radial-gradient(ellipse 80% 60% at 80% 10%,rgba(255,92,26,.07) 0%,transparent 60%), radial-gradient(ellipse 60% 50% at 20% 90%,rgba(80,40,200,.06) 0%,transparent 60%), var(--bg); }
        .stars { position:absolute; inset:0; pointer-events:none; z-index:0; }
        .orbit { position:absolute; border-radius:50%; border:1px solid rgba(255,255,255,.03); pointer-events:none; z-index:0; }
        .orbit-1 { width:500px; height:500px; top:-180px; left:-160px; }
        .orbit-2 { width:320px; height:320px; bottom:-100px; right:-80px; border-color:rgba(255,92,26,.05); }
        .card-wrap { position:relative; z-index:10; width:100%; max-width:420px; animation:floatIn .55s cubic-bezier(.22,1,.36,1) both; }
        .logo-ring { position:relative; width:68px; height:68px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }
        .logo-ring::before { content:''; position:absolute; inset:0; border-radius:50%; border:1px solid rgba(255,92,26,.4); animation:pulseRing 2.4s ease-out infinite; }
        .logo-inner { width:68px; height:68px; border-radius:50%; background:rgba(255,92,26,.10); border:1px solid rgba(255,92,26,.30); display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .heading { font-family:var(--font-display); font-size:28px; font-weight:800; letter-spacing:-.5px; text-align:center; color:var(--text); margin-bottom:4px; }
        .subheading { font-size:13.5px; color:var(--text-muted); text-align:center; margin-bottom:32px; }
        .card { background:var(--surface); border:1px solid var(--border); border-radius:22px; padding:32px; backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); box-shadow:0 0 0 1px rgba(255,255,255,.02),0 32px 64px rgba(0,0,0,.5); }
        .error-box { background:rgba(220,50,40,.12); border:1px solid rgba(220,50,40,.35); border-radius:10px; padding:11px 14px; font-size:13px; color:#f87171; margin-bottom:20px; animation:shake .35s ease; }
        .field-label { display:block; font-size:11.5px; font-weight:500; letter-spacing:.06em; text-transform:uppercase; color:var(--text-muted); margin-bottom:8px; }
        .phone-wrap { display:flex; align-items:stretch; gap:0; border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; transition:border-color .2s, box-shadow .2s; }
        .phone-wrap:focus-within { border-color:var(--border-focus); box-shadow:0 0 0 3px rgba(255,92,26,.10); }
        .phone-prefix { display:flex; align-items:center; gap:6px; padding:0 14px; background:rgba(255,255,255,.04); border-right:1px solid var(--border); font-size:15px; color:var(--text-muted); white-space:nowrap; user-select:none; font-family:var(--font-body); }
        .flag { font-size:18px; line-height:1; }
        .phone-input { flex:1; padding:13px 16px; background:transparent; border:none; color:var(--text); font-family:var(--font-body); font-size:15px; outline:none; letter-spacing:.05em; -webkit-appearance:none; }
        .phone-input::placeholder { color:var(--text-muted); letter-spacing:0; }
        .btn-primary { width:100%; padding:13.5px; background:var(--accent); border:none; border-radius:var(--radius); color:#fff; font-family:var(--font-display); font-size:15px; font-weight:700; cursor:pointer; transition:background .18s,transform .1s,box-shadow .2s; margin-top:20px; box-shadow:0 4px 20px rgba(255,92,26,.25); }
        .btn-primary:hover:not(:disabled) { background:#ff6e30; box-shadow:0 6px 28px rgba(255,92,26,.4); }
        .btn-primary:active:not(:disabled) { transform:scale(.98); }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
        .spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; vertical-align:-2px; margin-right:8px; }
        .otp-hint { font-size:13px; color:var(--text-muted); text-align:center; margin-bottom:20px; }
        .otp-hint strong { color:var(--text); font-weight:500; }
        .otp-grid { display:flex; gap:8px; justify-content:center; margin-bottom:8px; }
        .digit-input { width:48px; height:56px; text-align:center; font-family:var(--font-display); font-size:22px; font-weight:700; background:rgba(255,255,255,.05); border:1px solid var(--border); border-radius:12px; color:var(--text); outline:none; transition:border-color .15s,box-shadow .15s,transform .1s; caret-color:var(--accent); -webkit-appearance:none; }
        .digit-input:focus { border-color:var(--border-focus); box-shadow:0 0 0 3px rgba(255,92,26,.12); transform:translateY(-1px); }
        .digit-input.filled { border-color:rgba(255,92,26,.4); background:rgba(255,92,26,.07); }
        .resend-row { display:flex; justify-content:center; align-items:center; gap:6px; margin-top:16px; font-size:13px; color:var(--text-muted); }
        .resend-btn { background:none; border:none; color:var(--accent); font-family:var(--font-body); font-size:13px; font-weight:500; cursor:pointer; padding:0; }
        .resend-btn:disabled { opacity:.4; cursor:default; color:var(--text-muted); }
        .back-btn { display:block; width:100%; background:none; border:none; color:var(--text-muted); font-family:var(--font-body); font-size:13px; cursor:pointer; margin-top:14px; text-align:center; transition:color .15s; padding:6px 0; }
        .back-btn:hover { color:var(--text); }
        .divider { display:flex; align-items:center; gap:12px; margin:24px 0; color:var(--text-muted); font-size:12px; letter-spacing:.04em; text-transform:uppercase; }
        .divider::before,.divider::after { content:''; flex:1; height:1px; background:var(--border); }
        .google-wrap { display:flex; justify-content:center; min-height:44px; }
        .footer-text { text-align:center; margin-top:24px; font-size:13px; color:var(--text-muted); }
        .footer-link { color:var(--accent); font-weight:600; cursor:pointer; transition:color .15s; }
        .footer-link:hover { color:#ff7a3d; }
        .step-enter { animation:floatIn .35s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div className="page">
        <div className="stars" ref={starsRef} />
        <div className="orbit orbit-1" />
        <div className="orbit orbit-2" />

        <div className="card-wrap">
          <div className="logo-ring">
            <div className="logo-inner">
              <div style={{ position: "relative", width: 34, height: 34 }}>
                <Image src="/images/logo.png" alt="Gamified" fill style={{ objectFit: "contain" }} />
              </div>
            </div>
          </div>
          <h1 className="heading">Join the Mission</h1>
          <p className="subheading">Create your account in seconds</p>

          <div className="card">
            {error && <div className="error-box" key={error}>{error}</div>}

            {step === "phone" ? (
              <form key="phone-step" className="step-enter" onSubmit={handleRequestOtp}>
                <label className="field-label" htmlFor="phone-input">Mobile number</label>
                <div className="phone-wrap">
                  <div className="phone-prefix">
                    <span className="flag">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    id="phone-input"
                    className="phone-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    autoComplete="tel-national"
                    value={formatPhoneDisplay(phone)}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Sending…" : "Create Account"}
                </button>
              </form>
            ) : (
              <div key="otp-step" className="step-enter">
                <p className="otp-hint">Code sent to <strong>{maskedPhone.trim()}</strong></p>
                <label className="field-label" style={{ textAlign: "center", display: "block" }}>
                  Enter your code
                </label>
                <div className="otp-grid" onPaste={handleDigitPaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { digitRefs.current[i] = el; }}
                      className={`digit-input${d ? " filled" : ""}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      autoFocus={i === 0}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(i, e)}
                      disabled={loading}
                    />
                  ))}
                </div>

                {loading && (
                  <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 12 }}>
                    <span className="spinner" />Verifying…
                  </p>
                )}

                <div className="resend-row">
                  <span>Didn&apos;t receive it?</span>
                  <button type="button" className="resend-btn" onClick={handleResend} disabled={resendCooldown > 0 || loading}>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>

                <button type="button" className="back-btn"
                  onClick={() => { setStep("phone"); setError(""); setDigits(Array(OTP_LENGTH).fill("")); }}>
                  ← Use a different number
                </button>
              </div>
            )}

            <div className="divider">or continue with email</div>
            <div className="google-wrap"><div ref={googleBtnRef} /></div>
          </div>

          <p className="footer-text">
            Already have an account?{" "}
            <span className="footer-link" onClick={() => router.push("/login")}>Log in</span>
          </p>
        </div>
      </div>
    </>
  );
}