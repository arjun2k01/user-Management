import React, { useState } from "react";
import { API_URL } from "../../config";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

const AuthForm = ({ onAuthSuccess, onForgotPassword }) => {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const switchMode = () => {
    setError("");
    setForm((prev) => ({ ...prev, password: "" }));
    setMode((m) => (m === "login" ? "signup" : "login"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "login" : "signup";

      const body =
        mode === "login"
          ? {
              email: form.email,
              password: form.password,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
            };

      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send/receive cookies
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (!data.user) {
        throw new Error("Unexpected response from server");
      }

      onAuthSuccess?.({ user: data.user });
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "login" ? "Welcome back" : "Create an admin account";
  const subtitle =
    mode === "login"
      ? "Sign in to manage users, roles and access control."
      : "Sign up and start managing your user base in minutes.";

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
      {/* Info card (left, desktop) */}
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:block w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-black/90 p-6 shadow-2xl shadow-emerald-500/15">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-[11px] uppercase tracking-wide text-emerald-300">
            <ShieldCheck className="w-3 h-3" />
            Enterprise-grade access
          </div>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Control your entire user lifecycle
          </h2>
          <p className="text-xs text-slate-300 mb-4">
            Invite, deactivate, and update users from a single, secure console.
            Built with a dashboard-style layout so you can scan information
            quickly and keep your focus on what matters.
          </p>

          <ul className="space-y-1.5 text-xs text-slate-200">
            <li>• Real-time search, filters &amp; pagination</li>
            <li>• Role &amp; status-based visibility</li>
            <li>• Secure password and account flows</li>
          </ul>
        </div>
      </motion.div>

      {/* Auth form (right) */}
      <motion.div
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/95 dark:bg-black/60 backdrop-blur-xl p-6 shadow-lg dark:shadow-xl dark:shadow-black/60">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {title}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          </div>

          {error && (
            <div className="mb-4 text-[11px] rounded-2xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-rose-700 dark:text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  Full name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="E.g. Aditya Lalotra"
                    className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/60"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/60"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    mode === "signup"
                      ? "At least 6 characters"
                      : "Your password"
                  }
                  className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 py-2.5 pl-9 pr-9 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Links row */}
            <div className="flex items-center justify-between text-[11px] mt-1">
              <button
                type="button"
                onClick={switchMode}
                className="text-emerald-600 dark:text-emerald-300 hover:text-emerald-500 dark:hover:text-emerald-200 hover:underline underline-offset-2"
              >
                {mode === "login"
                  ? "Create a new account"
                  : "Already have an account? Log in"}
              </button>

              <button
                type="button"
                onClick={onForgotPassword}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-semibold py-2.5 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait…
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Sign up"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;
