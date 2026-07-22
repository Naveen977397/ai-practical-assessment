"use client";

import { useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ui/badges";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type FormState = {
  name: string;
  email: string;
  role: string;
  password: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  role: "Agent",
  password: "",
};

export function UserManagementPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to load users");
      }
      setUsers(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function startEdit(user: User) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role, password: "" });
    setFormError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = editingId
      ? {
          name: form.name,
          email: form.email,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        }
      : form;

    try {
      const response = await fetch(
        editingId ? `/api/users/${editingId}` : "/api/users",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save user");
      }

      cancelEdit();
      await loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;

    setError(null);
    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to delete user");
      }
      if (editingId === id) cancelEdit();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="app-page-title">User Management</h1>
        <p className="mt-1 app-muted">
          Create, update, and remove internal users
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      <section className="app-card">
        <h2 className="app-section-title">
          {editingId ? "Edit User" : "Add User"}
        </h2>
        {formError && (
          <div className="mt-4">
            <ErrorBanner message={formError} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="user-name" className="app-label">
                Name
              </label>
              <input
                id="user-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="app-input"
              />
            </div>
            <div>
              <label htmlFor="user-email" className="app-label">
                Email
              </label>
              <input
                id="user-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="app-input"
              />
            </div>
            <div>
              <label htmlFor="user-role" className="app-label">
                Role
              </label>
              <input
                id="user-role"
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="app-input"
                placeholder="Admin, Agent, Requester..."
              />
            </div>
            <div>
              <label htmlFor="user-password" className="app-label">
                {editingId ? "New password (optional)" : "Password"}
              </label>
              <input
                id="user-password"
                type="password"
                required={!editingId}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="app-input"
                minLength={8}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="app-btn-primary"
            >
              {editingId ? "Save Changes" : "Create User"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="app-btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="app-card">
        <h2 className="app-section-title">Users</h2>
        {loading ? (
          <p className="mt-4 app-muted">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="mt-4 app-muted">No users found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-3 py-3 text-slate-900">{user.name}</td>
                    <td className="px-3 py-3 text-slate-700">{user.email}</td>
                    <td className="px-3 py-3 text-slate-700">{user.role}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(user)}
                          className="app-link"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          className="text-sm font-medium text-red-700 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
