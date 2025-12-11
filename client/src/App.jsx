// client/src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useAuth } from "./AuthContext";
import AuthPage from "./pages/AuthPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import UserHomePage from "./pages/UserHomePage";
import NotFound from "./pages/NotFound";

const AppShell = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isAuthenticated = !!user;

  const handleUnauthorized = () => {
    logout();
  };

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
                {isAdmin ? "Admin console" : "User workspace"}
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
                onClick={logout}
                className="text-[11px] px-3 py-1.5 rounded-full border border-red-400/60 bg-red-500/10 text-red-600 dark:text-red-300 hover:bg-red-500/20 transition-colors"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content with routes */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          {/* Public login route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate
                  to={isAdmin ? "/admin" : "/app"}
                  replace
                />
              ) : (
                <AuthPage />
              )
            }
          />

          {/* Admin-only dashboard */}
          <Route
            path="/admin"
            element={
              isAuthenticated && isAdmin ? (
                <AdminDashboardPage onUnauthorized={handleUnauthorized} />
              ) : isAuthenticated ? (
                <Navigate to="/app" replace />
              ) : (
                <Navigate
                  to="/login"
                  replace
                  state={{ from: location }}
                />
              )
            }
          />

          {/* Authenticated user dashboard (any role) */}
          <Route
            path="/app"
            element={
              isAuthenticated ? (
                <UserHomePage onUnauthorized={handleUnauthorized} />
              ) : (
                <Navigate
                  to="/login"
                  replace
                  state={{ from: location }}
                />
              )
            }
          />

          {/* Default root */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate
                  to={isAdmin ? "/admin" : "/app"}
                  replace
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => <AppShell />;

export default App;
