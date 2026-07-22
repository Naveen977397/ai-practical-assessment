"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Priority, TicketStatus } from "@/app/generated/prisma";
import {
  EmptyState,
  ErrorBanner,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/badges";
import {
  ALL_PRIORITIES,
  ALL_STATUSES,
  DEFAULT_PAGE_SIZE,
  PRIORITY_LABELS,
  SORT_BY_OPTIONS,
  SORT_ORDER_OPTIONS,
  STATUS_LABELS,
} from "@/lib/constants";

type UserOption = { id: string; name: string };

type TicketListItem = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  assignedTo: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  createdAt: string;
};

type PaginatedResponse = {
  items: TicketListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const SORT_LABELS: Record<(typeof SORT_BY_OPTIONS)[number], string> = {
  createdAt: "Created",
  updatedAt: "Updated",
  priority: "Priority",
  title: "Title",
};

export function TicketListPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [priority, setPriority] = useState(searchParams.get("priority") ?? "");
  const [assignedToId, setAssignedToId] = useState(
    searchParams.get("assignedToId") ?? "",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") ?? "createdAt",
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") ?? "desc",
  );

  useEffect(() => {
    fetch("/api/users")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch(() => {});
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    const entries: [string, string | null][] = [
      ["q", searchParams.get("q")],
      ["status", searchParams.get("status")],
      ["priority", searchParams.get("priority")],
      ["assignedToId", searchParams.get("assignedToId")],
      ["sortBy", searchParams.get("sortBy") ?? "createdAt"],
      ["sortOrder", searchParams.get("sortOrder") ?? "desc"],
      ["page", searchParams.get("page") ?? "1"],
      ["limit", searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE)],
    ];

    for (const [key, value] of entries) {
      if (value) params.set(key, value);
    }

    try {
      const response = await fetch(`/api/tickets?${params.toString()}`);
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to load tickets");
      }
      const data: PaginatedResponse = await response.json();
      setTickets(data.items);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [searchParams, router]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (assignedToId) params.set("assignedToId", assignedToId);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    params.set("page", "1");
    params.set("limit", String(DEFAULT_PAGE_SIZE));
    router.push(`/tickets?${params.toString()}`);
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/tickets?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-page-title">Tickets</h1>
          <p className="mt-1 app-muted">Search, filter, and manage support requests</p>
        </div>
        <Link href="/tickets/new" className="app-btn-primary w-full sm:w-auto">
          New Ticket
        </Link>
      </div>

      <form onSubmit={applyFilters} className="app-card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="search" className="app-label">
              Search
            </label>
            <input
              id="search"
              type="search"
              placeholder="Search title or description..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label htmlFor="status-filter" className="app-label">
              Status
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="app-input"
            >
              <option value="">All statuses</option>
              {ALL_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="priority-filter" className="app-label">
              Priority
            </label>
            <select
              id="priority-filter"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="app-input"
            >
              <option value="">All priorities</option>
              {ALL_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="assignee-filter" className="app-label">
              Assignee
            </label>
            <select
              id="assignee-filter"
              value={assignedToId}
              onChange={(event) => setAssignedToId(event.target.value)}
              className="app-input"
            >
              <option value="">All assignees</option>
              <option value="unassigned">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort-by" className="app-label">
              Sort by
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="app-input"
            >
              {SORT_BY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {SORT_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort-order" className="app-label">
              Order
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="app-input"
            >
              {SORT_ORDER_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value === "asc" ? "Ascending" : "Descending"}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="app-btn-secondary w-full sm:w-auto">
          Apply Filters
        </button>
      </form>

      {loading && <p className="app-muted">Loading tickets...</p>}
      {error && <ErrorBanner message={error} />}
      {!loading && !error && tickets.length === 0 && (
        <EmptyState message="No tickets match your filters." />
      )}
      {!loading && !error && tickets.length > 0 && (
        <>
          <p className="app-meta">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} tickets
          </p>
          <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="border-b border-slate-200 last:border-b-0"
              >
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="block px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900">
                      {ticket.title}
                    </h2>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-700">
                    {ticket.description}
                  </p>
                  <p className="mt-3 app-meta">
                    Assignee: {ticket.assignedTo?.name ?? "Unassigned"} · Created
                    by {ticket.createdBy.name} ·{" "}
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="app-meta">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="app-btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="app-btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
