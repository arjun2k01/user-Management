import { useState, useEffect } from "react";
import AuthForm from "./components/Auth/AuthForm";
import UsersPage from "./components/Users/UsersPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [mode, setMode] = useState("login");

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");

    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
  }, []);

  const onAuthSuccess = (u, t) => {
    setUser(u);
    setToken(t);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  return !token ? (
    <AuthForm mode={mode} switchMode={() => setMode(mode === "login" ? "signup" : "login")} onAuthSuccess={onAuthSuccess} />
  ) : (
    <UsersPage user={user} token={token} onLogout={logout} />
  );
}
