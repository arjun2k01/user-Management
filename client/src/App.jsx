// src/App.jsx
import React, { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import AuthForm from "./components/Auth/AuthForm";
import UsersPage from "./components/Users/UsersPage";

const AppShell = () => {
  const { theme, toggleTheme } = useTheme();
  const [auth, setAuth] = useState(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) return null;
    try {
      return { token, user: JSON.parse(user) };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth?.token && auth?.user) {
      localStorage.setItem("token", auth.token);
      localStorage.setItem("user", JSON.stringify(auth.user));
    }
  }, [auth]);

  const handleAuthSuccess = ({ token, user }) => {
    setAuth({ token, user });
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const handleForgotPassword = () => {
    alert("TODO: open Forgot Password modal wired to /auth/forgot-password.");
  };

  const isAuthenticated = !!auth?.token;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      {/* Top bar */}
      <header className="border-b border-slate-200/60 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-emerald-500 flex items-center justify-center text-xs font-bold text-slate-950">
              UM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                User Management
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Admin console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="text-[11px] px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === "dark" ? "Switch to light" : "Switch to dark"}
            </button>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-[11px] px-3 py-1.5 rounded-full border border-red-400/60 bg-red-500/10 text-red-600 dark:text-red-300 hover:bg-red-500/20 transition-colors"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {!isAuthenticated ? (
          <AuthForm
            onAuthSuccess={handleAuthSuccess}
            onForgotPassword={handleForgotPassword}
          />
        ) : (
          <UsersPage auth={auth} />
        )}
      </main>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AppShell />
  </ThemeProvider>
);

export default App;
