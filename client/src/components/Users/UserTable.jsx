import { useState } from "react";
import { API_URL } from "../../config";

export default function UserTable({ users, fetchUsers, token, page }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", status: "" });

  const startEdit = (u) => {
    setEditing(u._id);
    setForm({ name: u.name, role: u.role, status: u.status });
  };

  const updateUser = async () => {
    const res = await fetch(`${API_URL}/users/${editing}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    setEditing(null);
    fetchUsers(page);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchUsers(page);
  };

  return (
    <table className="user-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {users.map((u) => (
          <tr key={u._id}>
            <td>
              {editing === u._id ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              ) : (
                u.name
              )}
            </td>

            <td>{u.email}</td>

            <td>
              {editing === u._id ? (
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option>User</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
              ) : (
                u.role
              )}
            </td>

            <td>
              {editing === u._id ? (
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              ) : (
                u.status
              )}
            </td>

            <td>{new Date(u.createdAt).toLocaleString()}</td>

            <td>
              {editing === u._id ? (
                <>
                  <button onClick={updateUser}>Save</button>
                  <button onClick={() => setEditing(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(u)}>Edit</button>
                  <button onClick={() => deleteUser(u._id)}>Delete</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
