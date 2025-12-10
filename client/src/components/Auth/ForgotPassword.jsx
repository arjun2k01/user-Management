import { useState } from "react";
import { API_URL } from "../../config";

export default function ForgotPassword({ goBack }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) return setErr(data.message);

    setMsg("Password reset successfully.");
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>

      {err && <div className="error">{err}</div>}
      {msg && <div className="success">{msg}</div>}

      <form onSubmit={submitHandler}>
        <input
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button type="submit">Reset Password</button>
      </form>

      <button className="link" onClick={goBack}>
        Back to Login
      </button>
    </div>
  );
}
