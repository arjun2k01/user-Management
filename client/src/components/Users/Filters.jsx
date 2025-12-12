// src/components/Users/Filters.jsx
import { Search } from "lucide-react";

const Filters = ({ filters, onChange }) => {
  return (
    <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950/90 shadow-sm p-3">
      <div className="grid gap-3 sm:grid-cols-4">
        {/* Search */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Search users
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                onChange({ search: e.target.value })
              }
              placeholder="Search by name or email"
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) =>
              onChange({ role: e.target.value })
            }
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-2 text-sm"
          >
            <option value="All">All</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({ status: e.target.value })
            }
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-2 text-sm"
          >
            <option value="All">All</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
