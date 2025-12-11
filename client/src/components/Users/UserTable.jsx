// src/components/Users/UserTable.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Trash2,
  Shield,
  User as UserIcon,
} from "lucide-react";

const roleBadgeClasses = (role) => {
  switch (role) {
    case "admin":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/40";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-100 dark:border-slate-500/40";
  }
};

const statusBadgeClasses = (status) => {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/40";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/40";
    case "disabled":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/40";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-100 dark:border-slate-500/40";
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

const UserTable = ({
  users,
  loading,
  error,
  onUpdateUser,
  onDeleteUser,
  currentUser,
}) => {
  const currentUserId = currentUser?._id;

  return (
    <div className="overflow-hidden">
      {/* Header row */}
      <div className="bg-slate-900 text-slate-50 text-[11px] font-medium uppercase tracking-wide">
        <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_80px] px-4 py-2">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Created</div>
          <div className="text-right">Actions</div>
        </div>
      </div>

      {/* Body */}
      <div className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
        {loading && (
          <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Loading users…
          </div>
        )}

        {!loading && error && (
          <div className="px-4 py-6 text-center text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            No users found for the current filters.
          </div>
        )}

        <AnimatePresence initial={false}>
          {!loading &&
            !error &&
            users.map((user, idx) => {
              const isYou = currentUserId && user._id === currentUserId;

              return (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, delay: idx * 0.02 }}
                  className={`grid grid-cols-[minmax(0,1.3fr)_minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_80px] items-center px-4 py-3 text-xs
                    ${isYou
                      ? "bg-emerald-50/70 dark:bg-emerald-500/5"
                      : "bg-white dark:bg-slate-950"
                    }
                    hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors`}
                >
                  {/* Name */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-900 dark:text-slate-50">
                        {user.name || "Unnamed"}
                      </span>
                      {isYou && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-200">
                          <UserIcon className="w-3 h-3" />
                          you
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {user._id?.slice(-6)}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="truncate text-xs text-slate-700 dark:text-slate-200">
                    {user.email}
                  </div>

                  {/* Role */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${roleBadgeClasses(
                        user.role
                      )}`}
                    >
                      {user.role === "admin" && (
                        <Shield className="w-3 h-3" />
                      )}
                      {user.role || "user"}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${statusBadgeClasses(
                        user.status
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.status === "active"
                            ? "bg-emerald-500"
                            : user.status === "pending"
                            ? "bg-amber-500"
                            : user.status === "disabled"
                            ? "bg-rose-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {user.status || "unknown"}
                    </span>
                  </div>

                  {/* Created */}
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    {formatDate(user.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateUser &&
                        onUpdateUser(user._id, {
                          role:
                            user.role === "admin"
                              ? "user"
                              : "admin",
                        })
                      }
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Role
                    </button>

                    <button
                      type="button"
                      disabled={isYou}
                      onClick={() =>
                        onDeleteUser && onDeleteUser(user._id)
                      }
                      className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-[10px] font-medium transition-colors ${
                        isYou
                          ? "border-slate-300 text-slate-400 bg-slate-100 cursor-not-allowed dark:border-slate-700 dark:text-slate-500 dark:bg-slate-900"
                          : "border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:border-rose-500/70 dark:text-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20"
                      }`}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserTable;
