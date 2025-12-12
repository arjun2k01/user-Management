import React, { useState } from "react";
import { API_URL } from "../../config";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, KeyRound, Loader2 } from "lucide-react";

const ForgotPassword = ({ onBack }) => {
  const [step, setStep] = useState("request"); // request | reset
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");

      setStatus({
        type: "success",
        message: data.message,
      });

      // In dev mode backend may return token (no email sender configured)
      if (data.token) {
        setToken(data.token);
        setStep("reset");
        setStatus({
          type: "success",
          message:
            "Token generated (DEV). Paste it below to reset password.",
        });
      } else {
        setStep("reset");
      }
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Error" });
    } finally {
      setLoading(false);
    }
  };

  const doReset = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (newPassword !== confirm) {
      setStatus({ type: "error", message: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setStatus({ type: "success", message: data.message });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Error" });
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
        className="mb-4 inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to login
      </button>

      <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/95 dark:bg-black/60 backdrop-blur-xl p-6 shadow-lg dark:shadow-xl dark:shadow-black/60">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-1">
          Reset password
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
          {step === "request"
            ? "Enter your email to receive a reset token."
            : "Enter reset token and new password."}
        </p>

        {status.message && (
          <div
            className={`mb-3 text-[11px] rounded-2xl px-3 py-2 border ${
              status.type === "success"
                ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-700 dark:text-emerald-200"
                : "bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-200"
            }`}
          >
            {status.message}
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={requestReset} className="space-y-3 text-xs">
            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
              Email address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-semibold py-2.5 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Request reset"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={doReset} className="space-y-3 text-xs">
            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
              Reset token
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token"
                className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-50"
              />
            </div>

            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
              New password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-50"
              />
            </div>

            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
              Confirm password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 py-2.5 px-3 text-xs text-slate-900 dark:text-slate-50"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-semibold py-2.5 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting…
                </>
              ) : (
                "Reset password"
              )}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
