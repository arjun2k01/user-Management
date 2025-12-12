// src/components/Audit/AuditLog.jsx
import { motion } from "framer-motion";
import { ShieldCheck, UserPlus, UserX, KeyRound } from "lucide-react";

const MOCK_EVENTS = [
  {
    id: 1,
    type: "login",
    message: "Admin logged in",
    time: "2 minutes ago",
    icon: ShieldCheck,
  },
  {
    id: 2,
    type: "password",
    message: "Password changed",
    time: "1 hour ago",
    icon: KeyRound,
  },
  {
    id: 3,
    type: "user",
    message: "New user created",
    time: "Yesterday",
    icon: UserPlus,
  },
  {
    id: 4,
    type: "user",
    message: "User account disabled",
    time: "2 days ago",
    icon: UserX,
  },
];

const AuditLog = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950/90 shadow-sm p-4"
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Recent activity
      </h3>

      <ul className="space-y-3">
        {MOCK_EVENTS.map((e) => {
          const Icon = e.icon;
          return (
            <li
              key={e.id}
              className="flex items-start gap-3 text-[11px] text-slate-600 dark:text-slate-300"
            >
              <div className="mt-0.5 h-7 w-7 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Icon className="h-3.5 w-3.5 text-emerald-600" />
              </div>

              <div className="flex-1">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {e.message}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  {e.time}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[10px] text-slate-400">
        Activity is shown for the last few actions only.
      </p>
    </motion.div>
  );
};

export default AuditLog;
