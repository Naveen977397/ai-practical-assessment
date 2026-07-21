import { TicketStatus } from "@/app/generated/prisma";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const colors: Record<TicketStatus, string> = {
    OPEN: "bg-blue-100 text-blue-900 ring-1 ring-blue-200",
    IN_PROGRESS: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
    RESOLVED: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200",
    CLOSED: "bg-slate-200 text-slate-800 ring-1 ring-slate-300",
    CANCELLED: "bg-rose-100 text-rose-900 ring-1 ring-rose-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({
  priority,
}: {
  priority: keyof typeof PRIORITY_LABELS;
}) {
  const colors: Record<keyof typeof PRIORITY_LABELS, string> = {
    LOW: "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
    MEDIUM: "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200",
    HIGH: "bg-orange-100 text-orange-900 ring-1 ring-orange-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
      role="alert"
    >
      {message}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
      {message}
    </div>
  );
}
