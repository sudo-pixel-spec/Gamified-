const API_URL = process.env.NEXT_PUBLIC_API_URL;

let accessToken = null;

export function setToken(token) {
  accessToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
}

export function getToken() {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
}

export async function restoreSession() {
  try {
    const res = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const token = json?.data?.accessToken ?? json?.accessToken;
    if (token) {
      setToken(token);
      return true;
    }
    return null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  if (!accessToken) {
    await restoreSession();
  }

  const buildHeaders = () => ({
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {}),
  });

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: buildHeaders(),
    });

    // ── 401: try refresh once then redirect ──
    if (res.status === 401) {
      const refreshed = await restoreSession();
      if (!refreshed) {
        accessToken = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
        return null;
      }
      // retry with new token
      const retryRes = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: buildHeaders(),
      });
      if (!retryRes.ok) {
        const text = await retryRes.text();
        throw new Error(
          `${retryRes.status} ${retryRes.statusText} — ${path}\n${text}`
        );
      }
      return retryRes.json();
    }

    // ── 403: not admin / forbidden ──
    if (res.status === 403) {
      const json = await res.json().catch(() => ({}));
      const msg = json?.message ?? json?.error ?? "Forbidden";
      throw new Error(
        `403 Forbidden: ${msg}\n\nYour account may not have admin privileges. Check that the "role" or "isAdmin" field is set correctly in your database for this user.`
      );
    }

    // ── other 4xx / 5xx ──
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${res.statusText} — ${path}\n${text}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    // re-throw so callers (seed, forms) see the real error
    // only swallow genuine network errors (no internet, CORS, etc.)
    if (
      err instanceof TypeError &&
      err.message.toLowerCase().includes("failed to fetch")
    ) {
      console.warn("Backend not reachable:", path, err);
      return null;
    }
    throw err;
  }
}
