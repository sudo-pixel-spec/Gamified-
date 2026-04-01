"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "../../lib/api";

export default function CompleteProfilePage() {
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/v1/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          avatarUrl,
          standard: "CBSE_STD_8",
          timezone,
        }),
      });
      if (!data) throw new Error("Failed to save profile");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background-dark px-6">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col items-center mb-10">

              <Image src="/images/logo.png" alt="Logo" className="h-16 rounded-lg object-contain mb-4" width={64} height={64} />
            <h1 className="text-2xl font-bold">Complete Your Profile</h1>
            <p className="text-slate-400 text-sm mt-2 text-center">
              Just a few more details to finish setting up your account.
            </p>
          </div>

          <div className="glass-card rounded-xl p-8 shadow-2xl">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm text-slate-300 ml-1">FULL NAME</label>
                <input
                  type="text"
                  placeholder="eg. Thomas Stark"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300 ml-1">PROFILE PHOTO URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300 ml-1">STANDARD</label>
                <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-slate-400">
                  CBSE — Standard 8 (only active standard)
                </div>
                <p className="text-xs text-slate-500 ml-1">Std 9 & 10 coming soon.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300 ml-1">TIMEZONE</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="Asia/Kolkata">India (IST) — Asia/Kolkata</option>
                  <option value="Asia/Dubai">Dubai — Asia/Dubai</option>
                  <option value="Asia/Singapore">Singapore — Asia/Singapore</option>
                  <option value="Europe/London">London — Europe/London</option>
                  <option value="America/New_York">New York — America/New_York</option>
                  <option value="America/Los_Angeles">Los Angeles — America/Los_Angeles</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl text-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}