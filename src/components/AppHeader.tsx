"use client";

import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/components/AuthProvider";

export function AppHeader() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/tickets"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Support Tickets
          </Link>
          <Link href="/api-docs" className="app-link">
            API Docs
          </Link>
          {isAdmin && (
            <Link href="/users" className="app-link">
              Users
            </Link>
          )}
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
