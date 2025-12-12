import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import PasswordStrength from "../components/PasswordStrength";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const loc = useLocation();
  const nav = useNavigate();
  const token = useMemo(() => new URLSearchParams(loc.search).get("token"), [loc.search]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Missing token. Open the link from email again.");
    if (password !== confirm) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      await axios.post("/auth/reset-password", { token, password });
      toast.success("Password updated. You are logged in.");
      nav("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <p className="mt-2 text-sm opacity-80">Set a new password for your account.</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div className="relative">
          <input
            className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 pr-10 outline-none"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <PasswordStrength value={password} />
        </div>

        <input
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          type="password"
          required
          minLength={8}
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-black text-white dark:bg-white dark:text-black py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
