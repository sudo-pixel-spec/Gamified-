"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, restoreSession } from "../lib/api";

export function useRequireAuth() {
  const router = useRouter();
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
        setUser(restored);
      }
      setLoading(false);
    };
    check();
  }, [router]);

  return { user, loading };
}