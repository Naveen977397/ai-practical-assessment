"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TicketStatus } from "@/app/generated/prisma";
import {
  EmptyState,
  ErrorBanner,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/badges";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/constants";

type TicketListItem = {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: TicketStatus;
  assignedTo: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  createdAt: string;
};

export function TicketListPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const statusParam = searchParams.get("status");
    if (q) params.set("q", q);
    if (statusParam) params.set("status", statusParam);

    try {
      const response = await fetch(`/api/tickets?${params.toString()}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to load tickets");
      }
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (status) params.set("status", status);
    router.push(`/tickets?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-page-title">Tickets</h1>
          <p className="mt-1 app-muted">Search and manage support requests</p>
        </div>
        <Link href="/tickets/new" className="app-btn-primary w-full sm:w-auto">
          New Ticket
        </Link>
      </div>

      <form
        onSubmit={applyFilters}
        className="app-card flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
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
        <div className="w-full sm:w-48">
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
        <button type="submit" className="app-btn-secondary w-full sm:w-auto">
          Apply Filters
        </button>
      </form>

      {loading && <p className="app-muted">Loading tickets...</p>}
      {error && <ErrorBanner message={error} />}
      {!loading && !error && tickets.length === 0 && (
        <EmptyState message="No tickets match your search." />
      )}
      {!loading && !error && tickets.length > 0 && (
        <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="border-b border-slate-200 last:border-b-0">
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
                  Assignee: {ticket.assignedTo?.name ?? "Unassigned"} · Created by{" "}
                  {ticket.createdBy.name} ·{" "}
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
