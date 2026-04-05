"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function GlobalNav({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: me, loading: authLoading, logout } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const isHomeRoute = pathname === "/dashboard" || pathname === "/subjects" || pathname === "/analytics" || pathname === "/leaderboard";
  // The global nav should be active for all these core student-facing pages
  const isStudentRoute = isHomeRoute;

  // Data Fetching (Stats & Unread Count) - Using centralized user profile
  useEffect(() => {
    if (!isStudentRoute || !me) return;
    
    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const data = await apiFetch("/v1/notifications/unread-count");
        if (cancelled) return;
        const val = typeof data === 'number' ? data : (data?.count ?? data?.unreadCount ?? data?.data?.count ?? data?.data ?? 0);
        setUnreadCount(Number(val) || 0); 
      } catch (err) {
        if (!cancelled) setUnreadCount(0);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // 30s poll

    return () => { 
      cancelled = true; 
      clearInterval(interval);
    };
  }, [pathname, isStudentRoute, me]);

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
    logout();
    router.push("/login");
  };

  // If not a student route, render children without nav shell
  if (!isStudentRoute) {
    return <>{children}</>;
  }

  // Loading state for the shell
  if (authLoading && !me) {
      return (
          <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
      );
  }

  const name = me?.profile?.fullName || "Learner";
  const firstName = name.split(" ")[0];
  const totalXP = me?.totalXP ?? 0;
  const streak = me?.streakCount ?? 0;
  const avatarUrl = me?.profile?.avatarUrl;

  return (
    <div className="min-h-screen relative flex flex-col bg-background-light dark:bg-background-dark text-slate-text dark:text-slate-text-dark">
      {/* ── Classic Sticky Header (Dashboard Only) ── */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
           <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <Link href="/dashboard" className="flex items-center gap-2">
                   <div className="relative w-8 h-8">
                      <Image src="/images/logo.png" alt="Logo" fill sizes="32px" priority className="object-contain" />
                   </div>
                   <span className="text-xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-orange">GAMIFIED</span>
                </Link>
                
                <div className="hidden md:flex items-center gap-6">
                   <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-primary transition-colors">Dashboard</Link>
                   <Link href="/subjects" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Courses</Link>
                   <Link href="/analytics" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Analytics</Link>
                   <Link href="/chat" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">AI Buddy</Link>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="hidden sm:flex items-center gap-4 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-white/10">
                       <span className="material-symbols-rounded text-primary text-lg">local_fire_department</span>
                       <span className="text-xs font-bold text-primary">{streak}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-rounded text-yellow-400 text-lg">bolt</span>
                       <span className="text-xs font-bold font-display uppercase tracking-wider">{totalXP.toLocaleString()} XP</span>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
                    {/* PERSISTENT NOTIFICATION BELL */}
                    <Link href="/notifications" className="relative p-2 text-slate-400 hover:text-primary transition-all">
                        <span className="material-symbols-rounded text-2xl">notifications</span>
                        {unreadCount > 0 && (
                           <span className="absolute top-1 right-1 flex h-4 w-4 bg-rose-500 rounded-full items-center justify-center text-[10px] font-black text-white ring-2 ring-white dark:ring-background-dark animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]">
                              {unreadCount}
                           </span>
                        )}
                    </Link>

                    <Link href="/profile" className="w-9 h-9 rounded-full ring-2 ring-primary/30 p-0.5 hover:ring-primary/60 transition-all overflow-hidden">
                       {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                       ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">{firstName[0]}</div>
                       )}
                    </Link>
                    <button onClick={() => setDrawerOpen(true)} className="text-slate-400 hover:text-primary transition-colors">
                       <span className="material-symbols-rounded text-2xl">menu</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* ── Bottom Navigation Bar (Dashboard Only) ── */}
      {isHomeRoute && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-between items-center gap-2 sm:gap-4">
            <Link href="/dashboard" className={`flex flex-col items-center shrink-0 gap-1 transition-colors ${pathname === "/dashboard" ? "text-primary" : "text-slate-400 hover:text-primary"}`}>
              <span className="material-symbols-rounded text-[24px]">grid_view</span>
              <span className="text-[10px] font-bold">Home</span>
            </Link>
            <Link href="/subjects" className={`flex flex-col items-center gap-1 transition-colors ${pathname.includes("/subjects") ? "text-primary" : "text-slate-400 hover:text-primary"}`}>
              <span className="material-symbols-rounded text-[24px]">map</span>
              <span className="text-[10px] font-bold">Learn</span>
            </Link>

            <div className="relative -top-5">
              <button
                onClick={handlePlay}
                className="bg-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-105 transition-transform border-4 border-white dark:border-card-dark"
              >
                <span className="material-symbols-rounded text-white text-3xl ml-1">play_arrow</span>
              </button>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary italic uppercase tracking-tighter">Mission</span>
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
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-white/10">
              <span className="text-sm font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-orange uppercase">Navigation Hub</span>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-primary p-1">
                <span className="material-symbols-rounded text-xl">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 w-full">
              {[
                { label: "Dashboard", href: "/dashboard", icon: "grid_view" },
                { label: `Notifications`, href: "/notifications", icon: "notifications", badge: unreadCount > 0 ? unreadCount : null },
                { label: "Courses", href: "/subjects", icon: "school" },
                { label: "AI Buddy", href: "/chat", icon: "forum" },
                { label: "Analytics", href: "/analytics", icon: "monitoring" },
                { label: "Leaderboard", href: "/leaderboard", icon: "emoji_events" },
                { label: "Profile", href: "/profile", icon: "person" }
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all border border-transparent ${isActive
                        ? "bg-primary/10 text-primary font-bold border-primary/20"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-rounded text-xl ${isActive ? 'text-primary' : 'text-white/30'}`}>{item.icon}</span>
                      <span className="text-[11px] font-display font-bold tracking-tight uppercase leading-none">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Admin Panel Link — visible only to admins */}
              {me?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 font-bold border border-orange-500/10 mt-1"
                >
                  <span className="material-symbols-rounded text-lg">admin_panel_settings</span>
                  <span className="text-[10px] uppercase font-black">Admin Panel</span>
                </Link>
              )}
            </div>

            <div className="mt-auto border-t border-slate-200 dark:border-white/10 pt-4 px-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-3 px-2 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-bold text-[10px] uppercase"
              >
                <span className="material-symbols-rounded text-lg">logout</span> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
