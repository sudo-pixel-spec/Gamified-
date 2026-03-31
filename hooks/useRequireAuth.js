"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, restoreSession, apiFetch } from "../lib/api";

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const check = async () => {
      let token = getToken();
      if (!token) {
        // Try to restore from refresh token cookie
        const restored = await restoreSession();
        if (!restored) {
          router.push("/login");
          return;
        }
      }

      // Fetch user data to verify profile completion
      try {
        const meData = await apiFetch("/v1/me");
        const profileUser = meData?.data || meData?.user || meData; // Account for generic wrapper
        
        if (profileUser) {
          setUser(profileUser);
          
          // Redirect to complete profile if not completed
          if (!profileUser.profileComplete && pathname !== "/completeprofile") {
            router.push("/completeprofile");
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
      
      setLoading(false);
    };
    check();
  }, [router, pathname]);

  return { user, loading };
}