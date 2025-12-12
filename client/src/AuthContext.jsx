// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";
import toast from "react-hot-toast";
import { AUTH_UNAUTHORIZED_EVENT } from "../lib/authEvents";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const saveUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  // Restore session from cookie (httpOnly JWT)
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (cancelled) return;

        if (res.status === 401) {
          // Not logged in
          saveUser(null);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          // keep existing user if any (temporary server issue)
          setLoading(false);
          return;
        }

        const data = await res.json().catch(() => ({}));
        if (data?.user) saveUser(data.user);
      } catch {
        // network error: keep existing user if any
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restore();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Enterprise: Global session-expired handling
  useEffect(() => {
    const handler = (e) => {
      // prevent repeated spam if many requests fail at once
      saveUser(null);

      const reason = e?.detail?.reason || "";
      toast.error(reason ? `Session expired: ${reason}` : "Session expired. Please log in again.");

      // hard redirect ensures clean state even if route guards are buggy
      window.location.href = "/login";
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (userData) => {
    saveUser(userData);
  };

  const logout = async () => {
    // optimistic logout UI
    saveUser(null);

    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }

    toast.success("Logged out");
    window.location.href = "/login";
  };

  const value = useMemo(() => {
    const isAdmin = user?.role === "admin";
    const isAuthed = !!user;
    return { user, isAdmin, isAuthed, loading, login, logout, setUser: saveUser };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
