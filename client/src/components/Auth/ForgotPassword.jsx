import { useState } from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email });
      toast.success("If an account exists, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <p className="mt-2 opacity-80 text-sm">
        Enter your email. We’ll send a password reset link.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <button
          disabled={loading}
          className="w-full rounded-xl bg-black text-white dark:bg-white dark:text-black py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
