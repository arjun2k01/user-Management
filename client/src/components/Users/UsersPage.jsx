import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../config";
import Filters from "./Filters";
import UserTable from "./UserTable";
import Pagination from "./Pagination";
import ChangePassword from "./ChangePassword";
import StatsSkeleton from "./StatsSkeleton";

import toast from "react-hot-toast";
import { Download, Users, UserCheck, ShieldHalf, AlertTriangle } from "lucide-react";

import { notifyUnauthorized } from "../../lib/authEvents";
import { downloadCsv } from "../../lib/exportCsv";

import AuditLog from "../Audit/AuditLog";

import {
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  Area as ReArea,
} from "recharts";

const UsersPage = ({ user }) => {
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
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const buildParams = (page, limit, f) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    // backend expects `q`
    if (f.search?.trim()) params.set("q", f.search.trim());

    // backend expects empty when "All"
    if (f.role !== "All") params.set("role", f.role);
    if (f.status !== "All") params.set("status", f.status);

    return params;
  };

  const fetchUsers = async (page = 1, overrideFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const params = buildParams(page, 5, overrideFilters);

      const res = await fetch(`${API_URL}/users?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        const data = await res.json().catch(() => ({}));
        notifyUnauthorized(data.message || "Unauthorized");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");

      setUsers(Array.isArray(data.users) ? data.users : []);
      setMeta({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total ?? (data.users?.length || 0),
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load users");
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

      if (results.some((r) => r.status === 401 || r.status === 403)) {
        notifyUnauthorized("Session expired");
        return;
      }

      const failed = results.find((r) => !r.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update user");
      }

      fetchUsers(meta.page, filters);
      toast.success("User updated");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not update user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        notifyUnauthorized("Session expired");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete user");

      toast.success("User deleted");
      fetchUsers(meta.page, filters);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not delete user");
    }
  };

  const handleExportCsv = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const LIMIT = 100;

      const firstParams = buildParams(1, LIMIT, filters);
      const firstRes = await fetch(`${API_URL}/users?${firstParams.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (firstRes.status === 401 || firstRes.status === 403) {
        const data = await firstRes.json().catch(() => ({}));
        notifyUnauthorized(data.message || "Unauthorized");
        return;
      }

      const firstData = await firstRes.json().catch(() => ({}));
      if (!firstRes.ok) throw new Error(firstData.message || "Export failed");

      const totalPages = firstData.totalPages || 1;
      let all = Array.isArray(firstData.users) ? [...firstData.users] : [];

      for (let p = 2; p <= totalPages; p++) {
        const params = buildParams(p, LIMIT, filters);
        const res = await fetch(`${API_URL}/users?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401 || res.status === 403) {
          const data = await res.json().catch(() => ({}));
          notifyUnauthorized(data.message || "Unauthorized");
          return;
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Export failed");

        if (Array.isArray(data.users)) all.push(...data.users);
      }

      const headers = ["Name", "Email", "Role", "Status", "Created At"];
      const rows = [
        headers,
        ...all.map((u) => [
          u.name || "",
          u.email || "",
          u.role || "",
          u.status || "",
          u.createdAt ? new Date(u.createdAt).toISOString() : "",
        ]),
      ];

      const stamp = new Date().toISOString().slice(0, 10);
      downloadCsv(`users_export_${stamp}.csv`, rows);

      toast.success(`Exported ${all.length} users`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Export failed");
    } finally {
      setExporting(false);
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
        value: u.status === "active" ? 3 : 0.5,
      })),
    [users]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Users overview
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Search, filter and manage all registered users.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <button
            onClick={handleExportCsv}
            disabled={exporting || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-60"
            title="Export users as CSV"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>

          <ChangePassword />
        </div>
      </div>

      {/* Stats + chart */}
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {loading ? (
            <StatsSkeleton />
          ) : (
            stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.id}
                  className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950 p-3 shadow-sm"
                >
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {stat.value}
                    </p>
                    <Icon className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950 p-3 shadow-sm">
          <div className="h-28">
            {loading ? (
              <div className="h-full bg-slate-200/70 dark:bg-white/10 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="label" hide />
                  <Tooltip />
                  <ReArea
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Main layout: left data + right panels */}
      <div className="grid lg:grid-cols-[minmax(0,2.3fr)_minmax(240px,1.2fr)] gap-5">
        {/* Left */}
        <div className="space-y-4">
          <Filters filters={filters} onChange={handleFiltersChange} />

          <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950/90 shadow-sm overflow-hidden">
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
                Page{" "}
                <span className="text-emerald-600 dark:text-emerald-300 font-medium">
                  {meta.page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {meta.totalPages}
                </span>
              </span>
              <span>
                Total users:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {meta.total}
                </span>
              </span>
            </div>
          </div>

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Right */}
        <div className="space-y-3">
          <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-slate-50/95 dark:bg-black/40 p-4 text-[11px] text-slate-700 dark:text-slate-300">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1.5">
              Security note
            </h3>
            <p>
              Backend must enforce role-based permissions for all actions. Never rely
              only on frontend.
            </p>
          </div>

          {/* ✅ Audit log added */}
          <AuditLog />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
