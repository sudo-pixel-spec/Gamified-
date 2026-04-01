"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "../../lib/api";

export default function CompleteProfilePage() {
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [standards, setStandards] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(""); // This will store standard.code
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    apiFetch("/v1/curriculum/standards")
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const activeOnes = list.filter(s => s.active !== false);
        if (!cancelled) {
          setStandards(activeOnes);
          if (activeOnes.length > 0) setSelectedStandard(activeOnes[0].code);
        }
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStandard) return setError("Please select a standard.");

    setLoading(true);
    setError("");
    try {
      // Find the full standard object to get the _id (ObjectId)
      const stdObj = standards.find(s => s.code === selectedStandard);

      // Use the Onboarding route as it is "Zero-Backend-Edit" safe (allows any standard string)
      const data = await apiFetch("/v1/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          standard: stdObj?._id || selectedStandard, // Pass the Database ID as the standard string
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
        <div className="w-full max-w-2xl pt-10 pb-20">
          <div className="flex flex-col items-center mb-10">
            <Image src="/images/logo.png" alt="Logo" className="h-16 rounded-lg object-contain mb-4" width={64} height={64} />
            <h1 className="text-3xl font-display font-black text-white tracking-widest uppercase mb-2">Complete Profile</h1>
            <p className="text-slate-400 text-sm font-medium">Just a few more details to launch your journey.</p>
          </div>

          <div className="bg-[#141414] border border-orange-500/20 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]"></div>
            
            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Pilot Name</label>
                <input
                  type="text"
                  placeholder="eg. Thomas Stark"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:border-primary transition-all focus:outline-none font-medium shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Avatar URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:border-primary transition-all focus:outline-none font-medium shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Select Academy Standard</label>
                <div className="relative group">
                  <select
                    value={selectedStandard}
                    onChange={(e) => setSelectedStandard(e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:border-primary transition-all focus:outline-none appearance-none font-bold cursor-pointer pr-12 shadow-inner"
                  >
                    {standards.length === 0 ? (
                      <option value="">Loading academy data...</option>
                    ) : (
                      standards.map(s => (
                        <option key={s._id} value={s.code} className="bg-[#141414] text-white py-2">
                          {s.name} ({s.code})
                        </option>
                      ))
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none group-hover:text-primary transition-colors">expand_more</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Mission Timezone</label>
                <div className="relative group">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:border-primary transition-all focus:outline-none appearance-none font-bold cursor-pointer pr-12 shadow-inner"
                  >
                    <option value="Asia/Kolkata" className="bg-[#141414]">India (IST) — Asia/Kolkata</option>
                    <option value="Asia/Dubai" className="bg-[#141414]">Dubai — Asia/Dubai</option>
                    <option value="Asia/Singapore" className="bg-[#141414]">Singapore — Asia/Singapore</option>
                    <option value="Europe/London" className="bg-[#141414]">London — Europe/London</option>
                    <option value="America/New_York" className="bg-[#141414]">New York — America/New_York</option>
                    <option value="America/Los_Angeles" className="bg-[#141414]">Los Angeles — America/Los_Angeles</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none group-hover:text-primary transition-colors">expand_more</span>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || (standards.length === 0 && !error)}
                  className="w-full bg-primary hover:bg-orange-600 text-white font-black py-5 rounded-2xl text-lg uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(255,107,0,0.4)] flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Initialize Voyage</span>
                      <span className="material-symbols-outlined">rocket_launch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}