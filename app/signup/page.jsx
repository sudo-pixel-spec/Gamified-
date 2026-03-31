"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken } from "../../lib/api";
import Image from "next/image";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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

    // signup always goes to complete profile first
    router.push("/completeprofile");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <div className="fixed inset-0 z-0 star-bg pointer-events-none">
        <div className="star w-1 h-1 top-10 left-10"></div>
        <div className="star w-2 h-2 top-20 left-1/4 opacity-50"></div>
        <div className="star w-1 h-1 top-40 right-1/3"></div>
        <div className="star w-1.5 h-1.5 bottom-20 left-1/2 opacity-40"></div>
        <div className="star w-1 h-1 top-60 right-10"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-black p-3 rounded-xl flex items-center justify-center w-20 h-20">
              <Image src="/images/logo.png" alt="Logo" className="h-12 rounded-lg object-cover" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Stellar Scholar</h1>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2 text-sm font-bold border border-primary/50 text-primary rounded-lg transition-all"
          >
            Log In
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full border-2 border-primary/30">
                <span className="material-symbols-outlined text-primary text-5xl">school</span>
              </div>
              <h2 className="text-4xl font-black text-slate-100 mb-2">Launch Your Learning Journey</h2>
              <p className="text-slate-400 max-w-md mx-auto">
               {" Enter your email to create your account. We'll send you a one-time code to verify."}
              </p>
            </div>

            <div className="glass-card rounded-xl p-8 shadow-2xl">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              {step === "email" ? (
                <form className="space-y-6" onSubmit={handleRequestOtp}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="@gmail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(244,140,37,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Sending OTP..." : "Create Account"}
                  </button>
                </form>
              ) : (
                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                  <div className="text-center text-sm text-slate-400 mb-2">
                    OTP sent to <span className="text-white font-medium">{email}</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Enter OTP</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(244,140,37,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Create Account"}
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

              <p className="text-center text-slate-400 text-sm mt-6">
                Already have an account?{" "}
                <span
                  className="text-primary font-semibold hover:underline cursor-pointer"
                  onClick={() => router.push("/login")}
                >
                  Log In
                </span>
              </p>
            </div>
          </div>
        </main>

        <footer className="p-8 text-center border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-medium">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#">Help Center</a>
          </div>
          <p className="mt-4 text-[10px] text-slate-600">© 2024 Gamified Inc. All systems go.</p>
        </footer>
      </div>
    </>
  );
}