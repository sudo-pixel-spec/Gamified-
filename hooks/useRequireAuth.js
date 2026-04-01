"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, restoreSession, apiFetch } from "../lib/api";

export function useRequireAuth(allowedRoles = []) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      let token = getToken();
      if (!token) {
        const restored = await restoreSession();
        if (!restored) {
          if (!cancelled) router.push("/login");
          return;
        }
      }

      try {
        const meData = await apiFetch("/v1/me");
        const profileUser = meData?.data || meData?.user || meData; 
        
        if (profileUser) {
          if (!cancelled) setUser(profileUser);
          
          // 1. Role Requirements (Students blocked from admin)
          if (allowedRoles.length > 0 && !allowedRoles.includes(profileUser.role)) {
            console.warn(`Unauthorized role: ${profileUser.role}. Required: ${allowedRoles}`);
            if (!cancelled) router.push("/dashboard");
            return;
          }

          // 2. Profile Completion (Only for students)
          if (profileUser.role === "student" && !profileUser.profileComplete && pathname !== "/completeprofile") {
            if (!cancelled) router.push("/completeprofile");
            return;
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (!cancelled) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [router, pathname, JSON.stringify(allowedRoles)]);

  return { user, loading };
}