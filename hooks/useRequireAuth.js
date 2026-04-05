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
          
          // 1. Role Requirements
          const role = profileUser.role;
          const type = profileUser.adminType;
          
          // Comprehensive "Super Admin" check:
          // Rule: Role must be "admin" AND (Type is "super" OR Type is Missing entirely)
          const isSuper = role === "admin" && (type === "super" || !type);

          if (allowedRoles.length > 0) {
            // Check if user has one of the allowed roles
            const hasRole = allowedRoles.includes(role);
            
            // Check if super access was required but user is NOT super
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