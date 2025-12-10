import { useState, useEffect } from "react";
import UserTable from "./UserTable";
import Filters from "./Filters";
import Pagination from "./Pagination";
import ChangePassword from "./ChangePassword";
import { API_URL } from "../../config";

export default function UsersPage({ user, token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    role: "All",
    status: "All",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const fetchUsers = async (page = 1) => {
    const params = new URLSearchParams({
      ...filters,
      page,
      limit: 5,
    });

    const res = await fetch(`${API_URL}/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    setUsers(data.users);
    setMeta({ page: data.page, totalPages: data.totalPages });
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  return (
    <div className="users-container">
      <div className="top-bar">
        <h2>User Management</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <ChangePassword token={token} />

      <Filters filters={filters} setFilters={setFilters} fetchUsers={fetchUsers} />

      <UserTable
        users={users}
        fetchUsers={fetchUsers}
        token={token}
        page={meta.page}
      />

      <Pagination meta={meta} fetchUsers={fetchUsers} />
    </div>
  );
}
