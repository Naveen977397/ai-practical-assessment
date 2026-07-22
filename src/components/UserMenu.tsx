"use client";

import { useAuth } from "@/components/AuthProvider";

export function UserMenu() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="app-muted">Loading...</span>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-sm text-slate-700">
        <span className="font-medium text-slate-900">{user.name}</span>
        <span className="app-meta ml-1">({user.role})</span>
      </span>
      <button type="button" onClick={logout} className="app-btn-secondary">
        Log out
      </button>
    </div>
  );
}
