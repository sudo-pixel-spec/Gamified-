"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { getToken, restoreSession } from "../lib/api";

export function useRequireAuth(allowedRoles = []) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, refreshUser } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      // If we are already loading, wait.
      if (loading) return;

      if (!user) {
        let token = getToken();
        if (!token) {
          const restored = await restoreSession();
          if (!restored) {
            if (!cancelled) router.push("/login");
            return;
          }
        }
        // If we have a token but no user, the AuthContext will handle the initial fetch,
        // but we can trigger a refresh if it hasn't happened yet.
        if (!loading) await refreshUser();
        return;
      }

      // 1. Role Requirements
      const role = user.role;
      const type = user.adminType;
      
      // Comprehensive "Super Admin" check:
      const isSuper = role === "admin" && (type === "super" || !type);

      if (allowedRoles.length > 0) {
        // Check if user has one of the allowed roles
        const hasRole = allowedRoles.includes(role);
        
        // Check if super access was required
        const superRequired = allowedRoles.includes("super");
        
        if (!hasRole && !(superRequired && isSuper)) {
          console.warn(`Unauthorized: role=${role}, type=${type}. Allowed: ${allowedRoles}`);
          if (!cancelled) router.push("/dashboard");
          return;
        }

        // Explicitly block regular admins from pages requiring "super"
        if (superRequired && !isSuper) {
          console.warn(`Super Admin required for this page.`);
          if (!cancelled) router.push("/dashboard");
          return;
        }
      }

      // 2. Profile Completion (Only for students)
      if (role === "student" && !user.profileComplete && pathname !== "/completeprofile") {
        if (!cancelled) router.push("/completeprofile");
        return;
      }
    };

    check();
    return () => { cancelled = true; };
  }, [router, pathname, user, loading, JSON.stringify(allowedRoles), refreshUser]);

  return { user, loading };
}