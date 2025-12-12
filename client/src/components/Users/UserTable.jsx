// src/components/Users/UserTable.jsx
import { motion } from "framer-motion";
import { Shield, Trash2, UserX, UserCheck } from "lucide-react";

const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-emerald-500/15 text-emerald-600",
    disabled: "bg-red-500/15 text-red-500",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
        map[status] || "bg-slate-500/15 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
};

const RoleBadge = ({ role }) => (
  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-500">
    {role}
  </span>
);

const UserTable = ({
  users,
  loading,
  error,
  onUpdateUser,
  onDeleteUser,
  currentUser,
}) => {
  /* ---------- STATES ---------- */
  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-10 rounded bg-slate-200/70 dark:bg-white/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500 text-center">{error}</div>
    );
  }

  if (!users.length) {
    return (
      <div className="p-6 text-sm text-slate-500 text-center">
        No users found for the current filters.
      </div>
    );
  }

  /* ---------- DESKTOP TABLE ---------- */
  return (
    <>
      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-[850px]">
          {/* Header */}
          <div className="grid grid-cols-6 gap-3 px-4 py-2 text-[11px] font-semibold uppercase text-slate-500 border-b dark:border-white/10">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Created</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Rows */}
          {users.map((u) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-6 gap-3 px-4 py-2 text-sm items-center border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-slate-500 truncate">{u.email}</div>
              <RoleBadge role={u.role} />
              <StatusBadge status={u.status} />
              <div className="text-xs text-slate-500">
                {new Date(u.createdAt).toLocaleDateString()}
              </div>

              <div className="flex justify-end gap-2">
                {u._id !== currentUser?.id && (
                  <>
                    <button
                      onClick={() =>
                        onUpdateUser(u._id, {
                          status:
                            u.status === "active" ? "disabled" : "active",
                        })
                      }
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10"
                      title="Toggle status"
                    >
                      {u.status === "active" ? (
                        <UserX className="w-4 h-4 text-red-500" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteUser(u._id)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ---------- MOBILE CARDS ---------- */}
      <div className="sm:hidden space-y-3 p-3">
        {users.map((u) => (
          <div
            key={u._id}
            className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-black/40 p-3 shadow-sm"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-medium text-sm">{u.name}</p>
                <p className="text-[11px] text-slate-500 break-all">
                  {u.email}
                </p>
              </div>
              <RoleBadge role={u.role} />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={u.status} />
              <span className="text-[10px] text-slate-500">
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>

            {u._id !== currentUser?.id && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() =>
                    onUpdateUser(u._id, {
                      status:
                        u.status === "active" ? "disabled" : "active",
                    })
                  }
                  className="flex-1 rounded-xl bg-slate-100 dark:bg-white/10 py-1.5 text-xs"
                >
                  Toggle status
                </button>
                <button
                  onClick={() => onDeleteUser(u._id)}
                  className="flex-1 rounded-xl bg-red-500/15 text-red-500 py-1.5 text-xs"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default UserTable;
