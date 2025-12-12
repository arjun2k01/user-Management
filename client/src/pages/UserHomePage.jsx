// client/src/pages/UserHomePage.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Clock,
  Lock,
  Activity,
  CheckCircle2,
} from "lucide-react";
import ChangePassword from "../components/Users/ChangePassword";
import { useAuth } from "../AuthContext";

const UserHomePage = ({ onUnauthorized }) => {
  const { user } = useAuth();

  if (!user) return null;

  const createdDate = user.createdAt ? new Date(user.createdAt) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            Welcome back, {user.name || "User"}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            This is your personal space – view your account details and keep
            your security up to date.
          </p>
        </div>
        <ChangePassword onUnauthorized={onUnauthorized} />
      </div>

      {/* Main layout */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)]">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950/90 p-5 shadow-sm dark:shadow-lg dark:shadow-black/40"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/50">
              <User className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Account overview
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Basic details about your profile and access level.
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-3 sm:grid-cols-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-0.5">
                Full name
              </p>
              <p className="font-medium text-slate-900 dark:text-slate-50">
                {user.name || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-0.5">
                Email address
              </p>
              <p className="font-medium flex items-center gap-1 text-slate-900 dark:text-slate-50">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-0.5">
                Role
              </p>
              <p className="inline-flex items-center gap-1 rounded-full border border-indigo-200 dark:border-indigo-500/60 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-200">
                <Shield className="w-3 h-3" />
                {user.role || "user"}
              </p>
            </div>
            <div>
              <p className="mt-2">
                Account status: <span className="font-semibold">{user?.status || "unknown"}</span>
              </p>

              <p className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-500/60 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                active
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-0.5">
                Member since
              </p>
              <p className="flex items-center gap-1 font-medium text-slate-900 dark:text-slate-50">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {createdDate ? createdDate.toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security + activity */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="space-y-3"
        >
          <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-slate-50/95 dark:bg-black/40 p-4 text-[11px] text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-7 w-7 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                  Security checklist
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  A few quick tips to keep your account safe.
                </p>
              </div>
            </div>
            <ul className="space-y-1 mt-1">
              <li>• Use a unique password for this account.</li>
              <li>• Avoid sharing your credentials with anyone.</li>
              <li>• Change your password if you notice unusual activity.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/95 dark:bg-slate-950/90 p-4 text-[11px] text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                  What you can do here
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  This is the &quot;user view&quot; of the platform, separate
                  from the admin console.
                </p>
              </div>
            </div>
            <ul className="space-y-1 mt-1">
              <li>• Review your profile information.</li>
              <li>• Update your password from the card above.</li>
              <li>
                • If you are also an admin, use the admin dashboard for managing
                other users.
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserHomePage;
