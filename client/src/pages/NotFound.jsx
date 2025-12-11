// client/src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const NotFound = () => {
  const { user, isAdmin } = useAuth();
  const target = user ? (isAdmin ? "/admin" : "/app") : "/login";
  const label = user
    ? isAdmin
      ? "Go to admin dashboard"
      : "Go to your dashboard"
    : "Go to login";

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
        404 – Page not found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        The page you’re looking for doesn’t exist or you don’t have access to
        it.
      </p>
      <Link
        to={target}
        className="inline-flex items-center rounded-full bg-emerald-500 text-xs font-semibold text-slate-950 px-4 py-2 shadow-md shadow-emerald-500/40 hover:bg-emerald-400 transition-colors"
      >
        {label}
      </Link>
    </div>
  );
};

export default NotFound;
