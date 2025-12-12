// src/components/Users/ChangePassword.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { API_URL } from "../../config";
import PasswordStrength from "../Auth/PasswordStrength";
import { Lock } from "lucide-react";
import { notifyUnauthorized } from "../../lib/authEvents";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters long");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      // ✅ Enterprise: global session-expired UX
      if (res.status === 401 || res.status === 403) {
        const data = await res.json().catch(() => ({}));
        notifyUnauthorized(data.message || "Unauthorized");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950/90 shadow-sm p-4"
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
        <Lock className="h-4 w-4 text-emerald-500" />
        Change password
      </h3>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Use a strong, unique password you don’t use anywhere else.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Current password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            New password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            minLength={8}
            required
          />
          <PasswordStrength password={newPassword} />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            minLength={8}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium py-2 transition"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </motion.div>
  );
};

export default ChangePassword;
