"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken, restoreSession } from "../../lib/api";
import Image from "next/image";

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const starsRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const container = starsRef.current;
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < 150; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 2 + 1 + "px";
      star.style.width = size;
      star.style.height = size;
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.setProperty("--duration", Math.random() * 3 + 2 + "s");
      container.appendChild(star);
    }
  }, []);

  useEffect(() => {
  const checkSession = async () => {
    const restored = await restoreSession();
    if (restored) {
      router.push("/dashboard");
    }
  };
  checkSession();
}, [router]);

  // Load Google Identity Services
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // Google sign-in callback
  const googleBtnRef = useRef(null);
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const onGsiLoaded = () => {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setLoading(true);
          setError("");
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ credential: response.credential }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error?.message || "Google sign-in failed");
            const data = json?.data ?? json;
            setToken(data.accessToken);
            if (data.user?.profileComplete) {
              router.push("/dashboard");
            } else {
              router.push("/completeprofile");
            }
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: "200",
      });
    };

    if (window.google?.accounts) {
      onGsiLoaded();
    } else {
      window.addEventListener("load", onGsiLoaded);
      const id = setInterval(() => { if (window.google?.accounts) { onGsiLoaded(); clearInterval(id); } }, 200);
      return () => { window.removeEventListener("load", onGsiLoaded); clearInterval(id); };
    }
  }, [router]);

  // Step 1 - Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/v1/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (!data) throw new Error("Failed to send OTP");
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 - Verify OTP
const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || "Invalid OTP");

    // unwrap ok() response
    const data = json?.data ?? json;
    setToken(data.accessToken);

    if (data.user?.profileComplete) {
      router.push("/dashboard");
    } else {
      router.push("/completeprofile");
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-background text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 relative">
      <div className="bg-blur-blob bg-orange-500 top-10 left-10"></div>
      <div className="bg-blur-blob bg-purple-600 bottom-10 right-10"></div>
      <div className="stars absolute inset-0 z-0 pointer-events-none" ref={starsRef}></div>

      <div className="relative w-full max-w-md z-10">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 px-4 py-2 text-xs rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:scale-105 transition"
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl shadow-xl shadow-purple-500/30 mb-4 transition-transform duration-300 hover:scale-110 overflow-hidden">
            <div className="relative w-10 h-10">
              <Image
                src="/images/logo.png"
                alt="Gamified Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gamified</h1>
          <p className="text-slate-500 dark:text-slate-400">Launch your learning journey today</p>
        </div>

        <div className="glass-card p-8 rounded-3xl shadow-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {step === "email" ? (
            <form className="space-y-6" onSubmit={handleRequestOtp}>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/70 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="text-center text-sm text-slate-400 mb-2">
                OTP sent to <span className="text-white font-medium">{email}</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Enter OTP</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔑</span>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/70 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500 transition"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setError(""); }}
                className="w-full text-sm text-slate-400 hover:text-white transition"
              >
                ← Use a different email
              </button>
            </form>
          )}

          <div className="relative my-8">
            <div className="flex items-center">
              <div className="flex-grow h-px bg-white/20"></div>
              <span className="mx-4 text-sm text-slate-400 whitespace-nowrap">Or continue with</span>
              <div className="flex-grow h-px bg-white/20"></div>
            </div>
          </div>

          <div className="flex justify-center">
            <div ref={googleBtnRef} className="flex items-center justify-center overflow-hidden rounded-xl" />
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-sm">
          {"Don't have an account yet?"}{" "}
          <span
            className="text-primary font-bold cursor-pointer hover:text-orange-400 hover:underline transition-colors"
            onClick={() => router.push("/signup")}
          >
            Join the Mission
          </span>
        </p>
      </div>
    </div>
  );
}