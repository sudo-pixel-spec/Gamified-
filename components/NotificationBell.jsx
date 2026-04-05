"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnread = useCallback(async () => {
    try {
      // NOTE: Using a fallback for missing learner-facing endpoints
      const res = await apiFetch("/v1/notifications/unread-count").catch(() => null);
      if (res?.data !== undefined) {
        setUnreadCount(res.data);
      } else {
        // Fallback mock check
        setUnreadCount(0);
      }
    } catch (e) {
      setUnreadCount(0);
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/v1/notifications").catch(() => null);
      if (res?.data) {
        const d = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        setNotifications(d.slice(0, 5));
      } else {
        setNotifications([]);
      }
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = useCallback((n) => {
    setIsOpen(false);
    // Priority 1: Direct Lesson Link
    if (n.lessonId) {
        router.push(`/lesson?lessonId=${n.lessonId}`);
        return;
    }
    // Priority 2: Subject/Structure Link
    if (n.subjectId) {
        router.push(`/structure?subjectId=${n.subjectId}`);
        return;
    }
    // Default: Just go to all notifications
    router.push('/notifications');
  }, [router]);

  const toggleDropdown = () => {
    if (!isOpen) fetchRecent();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${
          isOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'
        }`}
      >
        <span className="material-symbols-rounded text-2xl">
            {unreadCount > 0 ? "notifications_active" : "notifications"}
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 items-center justify-center text-[10px] font-black text-white">
                {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-[#141414] border border-white/10 rounded-[2.5rem] shadow-2xl z-[100] p-6 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary italic">Intelligence Feed</h3>
              <button 
                onClick={() => router.push('/notifications')}
                className="text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors"
                >View All</button>
           </div>

           <div className="space-y-4 max-h-96 overflow-y-auto no-scrollbar">
              {loading ? (
                 <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full"></div></div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-xs text-white/20 uppercase font-black">Scanning for transmissions...</p>
                </div>
              ) : (
                notifications.map(n => (
                    <div 
                      key={n._id} 
                      className="p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-primary/20 transition-all cursor-pointer group" 
                      onClick={() => handleNotificationClick(n)}
                    >
                        <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors">{n.title}</h4>
                        <p className="text-[10px] text-white/50 line-clamp-2 mt-1">{n.message}</p>
                        <p className="text-[8px] font-black uppercase text-white/20 mt-2 tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                ))
              )}
           </div>

           <div className="mt-6 pt-4 border-t border-white/5">
                <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 transition-all"
                >
                    Dismiss
                </button>
           </div>
        </div>
      )}
    </div>
  );
}
