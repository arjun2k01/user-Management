import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../config";
import { motion } from "framer-motion";
import { Users, UserCheck, ShieldHalf, AlertTriangle } from "lucide-react";
import Filters from "./Filters";
import UserTable from "./UserTable";
import Pagination from "./Pagination";
import ChangePassword from "./ChangePassword";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const UsersPage = ({ user, onUnauthorized }) => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    role: "All",
    status: "All",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildParams = (page, f) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "5");

    // ✅ backend expects `q`
    const q = (f.search || "").trim();
    if (q) params.set("q", q);

    // ✅ backend expects role/status empty when "All"
    const role = f.role === "All" ? "" : f.role;
    const status = f.status === "All" ? "" : f.status;

    if (role) params.set("role", role);
    if (status) params.set("status", status);

    // NOTE: your backend currently sorts only by createdAt desc.
    // If you later add sorting support, you can uncomment these:
    // params.set("sortBy", f.sortBy);
    // params.set("sortOrder", f.sortOrder);

    return params;
  };

  const fetchUsers = async (page = 1, overrideFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const params = buildParams(page, overrideFilters);

      const res = await fetch(`${API_URL}/users?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      // if unauthorized, handle cleanly
      if (res.status === 401 || res.status === 403) {
        onUnauthorized?.();
        setUsers([]);
        setMeta({ page: 1, totalPages: 1, total: 0 });
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
      setMeta({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total ?? (data.users?.length || 0),
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while loading users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltersChange = (patch) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    fetchUsers(1, next);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > meta.totalPages) return;
    fetchUsers(nextPage, filters);
  };

  // ✅ FIX: your backend does NOT have PUT /users/:id
  // It has:
  // PATCH /api/users/:id/role
  // PATCH /api/users/:id/status
  const handleUpdateUser = async (id, updates) => {
    try {
      const tasks = [];

      if (updates.role) {
        tasks.push(
          fetch(`${API_URL}/users/${id}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ role: updates.role }),
          })
        );
      }

      if (updates.status) {
        tasks.push(
          fetch(`${API_URL}/users/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: updates.status }),
          })
        );
      }

      const results = await Promise.all(tasks);

      // handle auth failure
      if (results.some((r) => r.status === 401 || r.status === 403)) {
        onUnauthorized?.();
        return;
      }

      // if any failed, show message
      const failed = results.find((r) => !r.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update user");
      }

      // refresh current page
      fetchUsers(meta.page, filters);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not update user");
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm("Delete this user? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        onUnauthorized?.();
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      fetchUsers(meta.page, filters);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not delete user");
    }
  };

  const stats = useMemo(() => {
    const total = meta.total;
    const active = users.filter((u) => u.status === "active").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const disabled = users.filter((u) => u.status === "disabled").length;

    return [
      { id: "total", label: "Total users", value: total, icon: Users },
      { id: "active", label: "Active (this page)", value: active, icon: UserCheck },
      { id: "admins", label: "Admins (this page)", value: admins, icon: ShieldHalf },
      { id: "disabled", label: "Disabled (this page)", value: disabled, icon: AlertTriangle },
    ];
  }, [users, meta.total]);

  const chartData = useMemo(
    () =>
      users.map((u, idx) => ({
        label: idx + 1,
        value: u.status === "active" ? 3 : u.status === "disabled" ? 0.5 : 1.5,
      })),
    [users]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            Users overview
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Search, filter and manage all registered users in your system.
          </p>
        </div>
        <ChangePassword onUnauthorized={onUnauthorized} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(230px,2fr)]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: idx * 0.03 }}
                className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950/80 px-3 py-3 shadow-sm dark:shadow-md dark:shadow-black/40"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent dark:from-emerald-500/10" />
                <div className="relative flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {stat.value}
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950/80 p-3 text-xs shadow-sm dark:shadow-md dark:shadow-black/40"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Activity snapshot
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-300">
                Relative activity score for users on this page
              </p>
            </div>
          </div>

          <div className="h-28 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="usersArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" hide />
                  <Tooltip
                    contentStyle={{
                      background: "#020617",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(148,163,184,0.5)",
                      fontSize: "11px",
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={1.5} fill="url(#usersArea)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[11px] text-slate-500">
                Not enough data to visualize yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,2.3fr)_minmax(240px,1.2fr)] gap-5">
        <div className="space-y-4">
          <Filters filters={filters} onChange={handleFiltersChange} />

          <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950/90 shadow-sm dark:shadow-xl dark:shadow-black/60 overflow-hidden">
            <UserTable
              users={users}
              loading={loading}
              error={error}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              currentUser={user}
            />

            <div className="border-t border-slate-200/70 dark:border-white/10 bg-slate-50/80 dark:bg-black/30 px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                Showing page{" "}
                <span className="text-emerald-600 dark:text-emerald-300 font-medium">{meta.page}</span> of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">{meta.totalPages}</span>
              </span>
              <span>
                Total users:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">{meta.total}</span>
              </span>
            </div>
          </div>

          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-slate-50/95 to-slate-50 dark:from-emerald-500/15 dark:via-slate-950/90 dark:to-slate-950 p-4 text-[11px] text-slate-700 dark:text-slate-200 shadow-md dark:shadow-lg dark:shadow-emerald-500/30">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1.5">
              Filter strategy tips
            </h3>
            <p className="mb-1.5">
              Use search, role and status together to narrow large user sets quickly.
            </p>
            <ul className="space-y-1">
              <li>• Search by email when investigating a single account.</li>
              <li>• Filter role="admin" for regular access reviews.</li>
              <li>• Filter status="disabled" to clean up stale accounts.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-slate-50/95 dark:bg-black/40 p-4 text-[11px] text-slate-700 dark:text-slate-300">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1.5">
              Security note
            </h3>
            <p>
              The backend must still enforce role-based permissions. Never rely on the frontend alone for access control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
