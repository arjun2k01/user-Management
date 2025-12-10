import { useState } from "react";
import { API_URL } from "../../config";

export default function ChangePassword({ token }) {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to change password");
        return;
      }

      setMsg(data.message || "Password changed successfully");
      setForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="mb-5 bg-white rounded-2xl border border-slate-100 p-4">
      <h2 className="text-sm font-semibold text-slate-800 mb-2">
        Change Password
      </h2>

      {msg && (
        <p className="text-xs text-emerald-600 mb-2">
          {msg}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 mb-2">
          {error}
        </p>
      )}

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={handleSubmit}
      >
        <input
          type="password"
          name="oldPassword"
          value={form.oldPassword}
          onChange={handleChange}
          placeholder="Old password"
          className="w-full sm:w-48 rounded-xl border border-slate-300 px-3 py-2 text-xs"
        />
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          placeholder="New password"
          className="w-full sm:w-48 rounded-xl border border-slate-300 px-3 py-2 text-xs"
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
        >
          Update
        </button>
      </form>
    </div>
  );
}
