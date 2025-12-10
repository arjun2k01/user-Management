import { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import { API_URL } from "../../config";

export default function AuthForm({ mode, onAuthSuccess, switchMode }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);

  const isLogin = mode === "login";

  if (forgot) {
    return <ForgotPassword goBack={() => setForgot(false)} />;
  }

  const changeHandler = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "login" : "signup";

    try {
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token);
    } catch {
      setError("Backend not reachable.");
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={submitHandler}>
        {!isLogin && (
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={changeHandler}
          />
        )}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={changeHandler}
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={changeHandler}
        />

        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>

      <button className="link" onClick={switchMode}>
        {isLogin ? "Create an account" : "Already have an account?"}
      </button>

      {isLogin && (
        <button className="link" onClick={() => setForgot(true)}>
          Forgot Password?
        </button>
      )}
    </div>
  );
}
