const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

let accessToken = null;
let refreshPromise = null;

/**
 * Persists the token to memory and optionally localStorage.
 * Security: While localStorage is vulnerable to XSS, we maintain it as a fallback
 * for a persistent session across tabs, but favor cookies (credentials: include).
 */
export function setToken(token) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }
}

/**
 * Retrieves the token from memory or localStorage.
 */
export function getToken() {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
}

/**
 * Attempts to restore the session using the HttpOnly refresh cookie.
 * Synchronized via refreshPromise to prevent race conditions.
 */
export async function restoreSession() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setToken(null);
        return null;
      }
      const json = await res.json();
      const token = json?.data?.accessToken ?? json?.accessToken;
      if (token) {
        setToken(token);
        return true;
      }
      return null;
    } catch (err) {
      console.warn("Session restoration failed:", err.message);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Hardened API fetch wrapper with automatic token refresh and sanitized error handling.
 */
export async function apiFetch(path, options = {}) {
  // If no token, attempt one quick restoration before the first call
  if (!getToken()) {
    await restoreSession();
  }

  const buildHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    };

    // Placeholder for CSRF protection if backend provides a token
    if (typeof window !== "undefined") {
      const csrfToken = document.cookie.split("; ").find(row => row.startsWith("XSRF-TOKEN="))?.split("=")[1];
      if (csrfToken) headers["X-XSRF-TOKEN"] = csrfToken;
    }

    return headers;
  };

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: buildHeaders(),
    });

    // ── 401 Unauthorized: Trigger a single synchronized refresh ──
    if (res.status === 401) {
      const refreshed = await restoreSession();
      if (!refreshed) {
        setToken(null);
        if (typeof window !== "undefined" && !path.includes("/me")) {
          // Only redirect if it's a critical data fetch failure
          window.location.href = "/login";
        }
        return null;
      }
      // Retry exactly once with the new token
      return apiFetch(path, options);
    }

    // ── 403 Forbidden: Standardize message without leaking internal role details ──
    if (res.status === 403) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.message || "Access Denied: Your sector permissions are insufficient.");
    }

    // ── Generic Error Handling: Sanitize res.text() to prevent stack trace leakage ──
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      
      // Map common status codes to user-friendly messages
      if (res.status === 429) {
        throw new Error("You're moving too fast! Please wait a moment before trying again.");
      }

      if (json?.message || json?.error) {
        const msg = typeof json.message === "object" ? JSON.stringify(json.message) : (json.message || json.error);
        throw new Error(msg);
      }
      throw new Error(`We encountered a tactical error (${res.status}). Our engineers are on it.`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    // Suppress purely transitive network errors in logs
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      console.warn("Network unreachable for path:", path);
      return null;
    }
    throw err;
  }
}
