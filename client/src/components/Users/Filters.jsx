// src/components/Users/Filters.jsx

import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { Filter, Search, ChevronsUpDown } from "lucide-react";

// Dropdown options
const roles = ["All", "admin", "user"];
const statuses = ["All", "active", "pending", "disabled"];
const sortFields = ["createdAt", "name", "email"];
const sortOrders = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

const Filters = ({ filters, onChange }) => {
  // Smart handler: supports both events (inputs) and direct values (Listbox)
  const updateField = (field) => (valueOrEvent) => {
    const value =
      typeof valueOrEvent === "string"
        ? valueOrEvent
        : valueOrEvent?.target?.value;

    if (!onChange) return;
    onChange({ [field]: value });
  };

  // Safe defaults so we never render undefined
  const safeFilters = {
    search: "",
    role: "All",
    status: "All",
    sortBy: "createdAt",
    sortOrder: "desc",
    ...filters,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center">
          <Filter className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Filters
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Combine search, role and status to quickly narrow users.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={safeFilters.search}
          onChange={updateField("search")}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 
                     dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100
                     text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Grid of filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Role */}
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
            Role
          </label>
          <Listbox value={safeFilters.role} onChange={updateField("role")}>
            <div className="relative">
              <Listbox.Button
                className="w-full border border-slate-300 dark:border-slate-600 
                           bg-white dark:bg-slate-800 text-left py-2.5 px-3 rounded-lg 
                           flex items-center justify-between text-sm text-slate-800 dark:text-slate-100"
              >
                <span>{safeFilters.role}</span>
                <ChevronsUpDown className="w-4 h-4 text-slate-400" />
              </Listbox.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Listbox.Options
                  className="absolute mt-1 w-full z-20 bg-white dark:bg-slate-800 
                             border border-slate-200 dark:border-slate-700 
                             rounded-lg shadow-lg text-sm max-h-52 overflow-auto"
                >
                  {roles.map((role) => (
                    <Listbox.Option
                      key={role}
                      value={role}
                      className={({ active }) =>
                        `cursor-pointer px-3 py-2 ${
                          active
                            ? "bg-indigo-500 text-white"
                            : "text-slate-700 dark:text-slate-100"
                        }`
                      }
                    >
                      {role}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
            Status
          </label>
          <Listbox value={safeFilters.status} onChange={updateField("status")}>
            <div className="relative">
              <Listbox.Button
                className="w-full border border-slate-300 dark:border-slate-600 
                           bg-white dark:bg-slate-800 text-left py-2.5 px-3 rounded-lg 
                           flex items-center justify-between text-sm text-slate-800 dark:text-slate-100"
              >
                <span>{safeFilters.status}</span>
                <ChevronsUpDown className="w-4 h-4 text-slate-400" />
              </Listbox.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Listbox.Options
                  className="absolute mt-1 w-full z-20 bg-white dark:bg-slate-800 
                             border border-slate-200 dark:border-slate-700 
                             rounded-lg shadow-lg text-sm max-h-52 overflow-auto"
                >
                  {statuses.map((status) => (
                    <Listbox.Option
                      key={status}
                      value={status}
                      className={({ active }) =>
                        `cursor-pointer px-3 py-2 ${
                          active
                            ? "bg-indigo-500 text-white"
                            : "text-slate-700 dark:text-slate-100"
                        }`
                      }
                    >
                      {status}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Sort field */}
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
            Sort by
          </label>
          <select
            value={safeFilters.sortBy}
            onChange={updateField("sortBy")}
            className="w-full border border-slate-300 dark:border-slate-600 
                       bg-white dark:bg-slate-800 py-2.5 px-3 rounded-lg 
                       text-sm text-slate-800 dark:text-slate-100 focus:outline-none 
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sortFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>

        {/* Sort order */}
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
            Order
          </label>
          <select
            value={safeFilters.sortOrder}
            onChange={updateField("sortOrder")}
            className="w-full border border-slate-300 dark:border-slate-600 
                       bg-white dark:bg-slate-800 py-2.5 px-3 rounded-lg 
                       text-sm text-slate-800 dark:text-slate-100 focus:outline-none 
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sortOrders.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default Filters;
