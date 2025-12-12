// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_URL } from "./config";
import toast from "react-hot-toast";

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

        // ✅ if not logged in, clear stale localStorage user
        if (res.status === 401) {
          saveUser(null);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          // other server errors – don't wipe user aggressively
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data?.user) saveUser(data.user);
      } catch {
        // network error: keep existing user if present
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

  const login = (userData) => {
    // Call this after successful /auth/login response
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
