import React, { useState } from "react";
import { API_URL } from "../../config";
import { motion } from "framer-motion";
import {
  Lock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const ChangePassword = ({ onUnauthorized }) => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        onUnauthorized?.();
        throw new Error("Session expired. Please log in again.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setStatus({ type: "success", message: "Password updated successfully." });
      setForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.message || "Could not change password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/95 dark:bg-slate-950/90 px-4 py-3 shadow-sm dark:shadow-md max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-7 w-7 rounded-full bg-violet-500/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
              Change password
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Update your account password securely.
            </p>
          </div>
        </div>

        {/* Old password */}
        <div className="relative">
          <input
            type={showOld ? "text" : "password"}
            name="oldPassword"
            required
            value={form.oldPassword}
            onChange={handleChange}
            placeholder="Old password"
            className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 py-2 px-3 pr-9 text-[11px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/60"
          />
          <button
            type="button"
            onClick={() => setShowOld((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            {showOld ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* New password */}
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            name="newPassword"
            required
            minLength={6}
            value={form.newPassword}
            onChange={handleChange}
            placeholder="New password"
            className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 py-2 px-3 pr-9 text-[11px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/60"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            {showNew ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex items-center justify-center rounded-2xl bg-violet-500 text-[11px] font-semibold text-white px-4 py-1.5 hover:bg-violet-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Updating…" : "Update"}
        </button>

        {status.message && (
          <div
            className={`mt-1 flex items-center gap-1.5 text-[10px] ${
              status.type === "success"
                ? "text-emerald-600 dark:text-emerald-300"
                : "text-rose-600 dark:text-rose-300"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default ChangePassword;
