"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getToken } from "../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "";

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error?.message || "Request failed");
  }
  return json?.data ?? json;
}

export default function GlobalNav({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [me, setMe] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  // Student routes that should have the global navigation
  const isStudentRoute = pathname && pathname === "/dashboard";

  useEffect(() => {
    if (!isStudentRoute) return;
    const token = getToken();
    if (!token) return;
    
    let cancelled = false;
    api("/v1/me", { token })
      .then(data => {
        if (!cancelled) setMe(data);
      })
      .catch(err => console.error("Failed to fetch user in nav:", err));

    return () => { cancelled = true; };
  }, [isStudentRoute, pathname]); // Re-fetch occasionally or at least on mount

  // handle ESC to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    if (isDrawerOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  // click outside to close drawer
  const handleOverlayClick = (e) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target)) {
      setDrawerOpen(false);
    }
  };

  const handlePlay = () => {
    const lastLesson = me?.progress?.lastLessonId || me?.stats?.lastLessonId;
    if (lastLesson) {
      router.push(`/lesson?lessonId=${lastLesson}`);
    } else {
      router.push("/subjects");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  if (!isStudentRoute) {
    return <>{children}</>;
  }

  const name = me?.profile?.fullName || "Learner";
  const firstName = name.split(" ")[0];
  const totalXP = me?.totalXP ?? 0;
  const streak = me?.streakCount ?? 0;
  const level = me?.level ?? 1;
  const avatarUrl = me?.profile?.avatarUrl;

  return (
    <div className="min-h-screen relative flex flex-col bg-background-light dark:bg-background-dark text-slate-text dark:text-slate-text-dark">
      {/* ── Top Header ── */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <div className="relative w-10 h-10">
                    <Image
                      src="/images/logo.png"
                      alt="Gamified Logo"
                      fill
                      sizes="40px"
                      priority
                      className="object-contain"
                    />
                  </div>
                </div>
                <span className="text-xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-orange hidden sm:block">GAMIFIED</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                  <Link href="/dashboard" className={`text-sm font-medium transition-colors ${pathname === "/dashboard" ? "text-primary" : "text-slate-500 hover:text-primary"}`}>Dashboard</Link>
                  <Link href="/subjects" className={`text-sm font-medium transition-colors ${pathname.includes("/subjects") ? "text-primary" : "text-slate-500 hover:text-primary"}`}>Courses</Link>
                  <Link href="/analytics" className={`text-sm font-medium transition-colors ${pathname.includes("/analytics") ? "text-primary" : "text-slate-500 hover:text-primary"}`}>Analytics</Link>
                  <Link href="/chat" className={`text-sm font-medium transition-colors ${pathname.includes("/chat") ? "text-primary" : "text-slate-400 hover:text-primary"}`}>AI Buddy</Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/analytics" className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                <span className="material-symbols-rounded text-yellow-400 text-lg">bolt</span>
                <span className="text-xs font-bold font-display uppercase tracking-wider">{totalXP.toLocaleString()} XP</span>
              </Link>
              <Link href="/analytics" className="flex items-center gap-2 bg-orange-50 dark:bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 hover:bg-orange-100 dark:hover:bg-primary/20 transition-colors">
                <span className="material-symbols-rounded text-primary text-lg">local_fire_department</span>
                <span className="text-xs font-bold text-primary font-display">{streak} DAY</span>
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
                <Link href="/profile" className="block w-9 h-9 rounded-full ring-2 ring-primary/30 p-0.5 hover:ring-primary/60 transition-all cursor-pointer">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" width={36} height={36} loading="eager" fetchPriority="high" referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || "U")}&background=F97316&color=fff&size=128`} alt="Default Avatar" width={36} height={36} loading="eager" fetchPriority="high" referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover bg-primary/10" />
                  )}
                </Link>
                <button 
                  onClick={() => setDrawerOpen(true)}
                  className="text-slate-400 hover:text-primary transition-colors flex items-center p-1"
                >
                  <span className="material-symbols-rounded text-2xl">menu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      {/* pb-24 padding so content isn't covered by the bottom nav only when on dashboard */}
      <main className={`flex-1 ${pathname === "/dashboard" ? "pb-24" : ""}`}>
        {children}
      </main>

      {/* ── Bottom Navigation Bar ── */}
      {isStudentRoute && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-between items-center gap-2 sm:gap-4">
          <Link href="/dashboard" className={`flex flex-col items-center shrink-0 gap-1 transition-colors ${pathname.includes("/dashboard") ? "text-primary" : "text-slate-400 hover:text-primary"}`}>
            <span className="material-symbols-rounded text-[24px]">grid_view</span>
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link href="/subjects" className={`flex flex-col items-center gap-1 transition-colors ${pathname.includes("/school") || pathname.includes("/subjects") ? "text-primary" : "text-slate-400 hover:text-primary"}`}>
            <span className="material-symbols-rounded text-[24px]">school</span>
            <span className="text-[10px] font-bold">Learn</span>
          </Link>
          
          <div className="relative -top-5">
            <button 
              onClick={handlePlay} 
              className="bg-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-105 transition-transform border-4 border-white dark:border-card-dark"
            >
              <span className="material-symbols-rounded text-white text-3xl ml-1">play_arrow</span>
            </button>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary">Play</span>
          </div>

          <Link href="/analytics" className={`flex flex-col items-center gap-1 transition-colors ${pathname.includes("/analytics") ? "text-primary" : "text-slate-400 hover:text-primary"}`}>
            <span className="material-symbols-rounded text-[24px]">monitoring</span>
            <span className="text-[10px] font-bold">Stats</span>
          </Link>
          <Link href="/leaderboard" className={`flex flex-col items-center gap-1 transition-colors ${pathname.includes("/leaderboard") ? "text-primary" : "text-slate-400 hover:text-primary"}`}>
            <span className="material-symbols-rounded text-[24px]">emoji_events</span>
            <span className="text-[10px] font-bold">Rank</span>
          </Link>
        </div>
      </div>
      )}

      {/* ── Hamburger Side Drawer ── */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-[100] flex justify-end"
          onClick={handleOverlayClick}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div 
            ref={drawerRef}
            className="relative w-64 md:w-80 h-full bg-background-light dark:bg-background-dark border-l border-slate-200 dark:border-white/10 flex flex-col p-6 animate-in slide-in-from-right duration-200 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
              <span className="text-xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-orange">MENU</span>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-primary p-2">
                <span className="material-symbols-rounded text-2xl">close</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto w-full">
              {[
                { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
                { label: "Courses", href: "/subjects", icon: "school" },
                { label: "AI Buddy", href: "/chat", icon: "forum" },
                { label: "Analytics", href: "/analytics", icon: "monitoring" },
                { label: "Leaderboard", href: "/leaderboard", icon: "emoji_events" },
                { label: "Profile", href: "/profile", icon: "person" }
              ].map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-primary/10 text-primary font-bold" 
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-medium hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-rounded text-[22px]">{item.icon}</span> 
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin Panel Link — visible only to admins */}
              {(me?.role === "admin" || me?.role === "super_admin") && (
                <Link 
                  href="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 font-bold border border-orange-500/10 mt-2"
                >
                  <span className="material-symbols-rounded text-[22px]">admin_panel_settings</span> 
                  Admin Panel
                </Link>
              )}
            </div>

            <div className="mt-auto border-t border-slate-200 dark:border-white/10 pt-6 px-2">
              <button 
                onClick={handleLogout} 
                className="flex items-center w-full gap-4 px-3 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
              >
                <span className="material-symbols-rounded text-[22px]">logout</span> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
