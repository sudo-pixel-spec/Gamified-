"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getToken, apiFetch, restoreSession, setToken as apiSetToken } from "../lib/api";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch("/v1/me");
      const userData = data?.data || data?.user || data;
      if (userData) {
        setUser(userData);
      }
      return userData;
    } catch (err) {
      console.error("AuthContext: Profile fetch failed", err);
      // Only null out if we are sure the session is gone (e.g. 401)
      if (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized")) {
        setUser(null);
      }
      return null;
    }
  }, []);

  const login = useCallback(async (token, userData) => {
    apiSetToken(token);
    if (userData) {
      setUser(userData);
    }
    // Deep-refresh the user object from /v1/me to ensure scores/XP/images are loaded
    // before the login page redirects the user to the dashboard.
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      // Notify backend if possible (ignore errors if not supported)
      if (typeof window !== "undefined") {
        await apiFetch("/v1/auth/logout", { method: "POST" }).catch(() => null);
        localStorage.removeItem("accessToken");
      }
    } finally {
      setUser(null);
      apiSetToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        let token = getToken();
        if (!token) {
          const restored = await restoreSession();
          if (!restored) {
            if (!cancelled) setLoading(false);
            return;
          }
        }

        // We have a token (either from localStorage or restored session)
        const profile = await refreshUser();
        if (!cancelled) {
          setUser(profile);
        }
      } catch (err) {
        console.error("AuthContext: Initialization failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initAuth();
    return () => { cancelled = true; };
  }, [refreshUser]);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
