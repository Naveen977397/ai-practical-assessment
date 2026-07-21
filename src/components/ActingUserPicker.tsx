"use client";

import { useActingUser } from "@/components/ActingUserProvider";

export function ActingUserPicker() {
  const { users, actingUser, setActingUserId, loading } = useActingUser();

  if (loading) {
    return <span className="app-muted">Loading users...</span>;
  }

  return (
    <label className="flex flex-col gap-1.5 text-sm sm:flex-row sm:items-center sm:gap-2">
      <span className="font-medium text-slate-700">Acting as</span>
      <select
        value={actingUser?.id ?? ""}
        onChange={(event) => setActingUserId(event.target.value)}
        className="app-input w-full sm:w-auto sm:min-w-[220px]"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
    </label>
  );
}
