// src/components/Auth/ForgotPassword.jsx
import React, { useState } from "react";
import { API_URL } from "../../config";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";

const ForgotPassword = ({ onBack }) => {
  const [form, setForm] = useState({ email: "", newPassword: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");

      setStatus({
        type: "success",
        message:
          data.message ||
          "If the email exists, the password has been updated successfully.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Something went wrong. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md mx-auto"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-emerald-300"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to login
      </button>

      <div className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 shadow-xl shadow-black/60">
        <h2 className="text-xl font-semibold text-slate-50 mb-1">
          Reset password
        </h2>
        <p className="text-[11px] text-slate-400 mb-4">
          Enter your account email and a new password to reset your access.
        </p>

        {status.message && (
          <div
            className={`mb-3 text-[11px] rounded-2xl px-3 py-2 border ${
              status.type === "success"
                ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-200"
                : "bg-red-500/10 border-red-500/40 text-red-200"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-200">
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
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-2.5 pl-9 pr-3 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-200">
              New password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="newPassword"
                required
                minLength={6}
                value={form.newPassword}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-2.5 pl-9 pr-3 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-semibold py-2.5 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Reset password"
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
