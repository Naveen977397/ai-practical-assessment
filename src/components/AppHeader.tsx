import Link from "next/link";
import { ActingUserPicker } from "@/components/ActingUserPicker";

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/tickets"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          Support Tickets
        </Link>
        <ActingUserPicker />
      </div>
    </header>
  );
}
