const ROLES = ["All", "Admin", "Manager", "User"];
const STATUSES = ["All", "Active", "Inactive"];

export default function Filters({ filters, setFilters, fetchUsers }) {
  const update = (key, value) => setFilters({ ...filters, [key]: value });

  return (
    <div className="filters">
      <input
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
      />

      <select
        value={filters.role}
        onChange={(e) => update("role", e.target.value)}
      >
        {ROLES.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <button onClick={() => fetchUsers(1)}>Apply</button>
    </div>
  );
}
