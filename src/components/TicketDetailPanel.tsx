"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Priority, TicketStatus } from "@/app/generated/prisma";
import { BackToTicketsLink } from "@/components/BackToTicketsLink";
import {
  ErrorBanner,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/badges";
import {
  PRIORITY_LABELS,
  STATUS_ACTION_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { getValidTransitions } from "@/lib/ticket-state-machine";

type User = { id: string; name: string; email: string; role: string };

type Comment = {
  id: string;
  message: string;
  createdAt: string;
  createdBy: User;
};

type TicketDetail = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  assignedTo: User | null;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
};

export function TicketDetailPanel({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [assignedToId, setAssignedToId] = useState("");
  const [commentMessage, setCommentMessage] = useState("");

  async function loadTicket() {
    setLoading(true);
    setError(null);
    try {
      const [ticketRes, usersRes] = await Promise.all([
        fetch(`/api/tickets/${ticketId}`),
        fetch("/api/users"),
      ]);

      if (!ticketRes.ok) {
        const data = await ticketRes.json();
        throw new Error(data.error ?? "Ticket not found");
      }

      const ticketData: TicketDetail = await ticketRes.json();
      setTicket(ticketData);
      setTitle(ticketData.title);
      setDescription(ticketData.description);
      setPriority(ticketData.priority);
      setAssignedToId(ticketData.assignedTo?.id ?? "");

      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          assignedToId: assignedToId || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update ticket");
      }

      setTicket((prev) => (prev ? { ...prev, ...data, comments: prev.comments } : prev));
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update ticket");
    }
  }

  async function handleStatusChange(nextStatus: TicketStatus) {
    setStatusError(null);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Invalid status transition");
      }

      setTicket((prev) => (prev ? { ...prev, ...data, comments: prev.comments } : prev));
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : "Invalid status transition",
      );
    }
  }

  async function handleAddComment(event: React.FormEvent) {
    event.preventDefault();
    setCommentError(null);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: commentMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to add comment");
      }

      setCommentMessage("");
      await loadTicket();
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Failed to add comment");
    }
  }

  if (loading) {
    return <p className="app-muted">Loading ticket...</p>;
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error ?? "Ticket not found"} />
        <BackToTicketsLink />
      </div>
    );
  }

  const validTransitions = getValidTransitions(ticket.status);

  return (
    <div className="space-y-6">
      <div>
        <BackToTicketsLink />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="app-page-title">{ticket.title}</h1>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
        <p className="mt-2 app-muted">
          Created by {ticket.createdBy.name} ·{" "}
          {new Date(ticket.createdAt).toLocaleString()} · Updated{" "}
          {new Date(ticket.updatedAt).toLocaleString()}
        </p>
      </div>

      <section className="app-card space-y-4">
        <h2 className="app-section-title">Status</h2>
        {statusError && <ErrorBanner message={statusError} />}
        {validTransitions.length === 0 ? (
          <p className="app-muted">No further status changes available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {validTransitions.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                className="app-btn-secondary"
              >
                {STATUS_ACTION_LABELS[status] ?? STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="app-card">
        <h2 className="app-section-title">Edit Ticket</h2>
        {saveError && (
          <div className="mt-4">
            <ErrorBanner message={saveError} />
          </div>
        )}
        <form onSubmit={handleSave} className="mt-5 space-y-5">
          <div>
            <label htmlFor="edit-title" className="app-label">
              Title
            </label>
            <input
              id="edit-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label htmlFor="edit-description" className="app-label">
              Description
            </label>
            <textarea
              id="edit-description"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="app-input"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-priority" className="app-label">
                Priority
              </label>
              <select
                id="edit-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="app-input"
              >
                {Object.values(Priority).map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-assignee" className="app-label">
                Assignee
              </label>
              <select
                id="edit-assignee"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="app-input"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="app-btn-primary">
            Save Changes
          </button>
        </form>
      </section>

      <section className="app-card space-y-5">
        <h2 className="app-section-title">Comments</h2>
        {ticket.comments.length === 0 ? (
          <p className="app-muted">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {ticket.comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm leading-relaxed text-slate-800">
                  {comment.message}
                </p>
                <p className="mt-2 app-meta">
                  {comment.createdBy.name} ·{" "}
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddComment} className="space-y-3 border-t border-slate-200 pt-5">
          {commentError && <ErrorBanner message={commentError} />}
          <label htmlFor="comment" className="app-label">
            Add a comment
          </label>
          <textarea
            id="comment"
            rows={3}
            value={commentMessage}
            onChange={(e) => setCommentMessage(e.target.value)}
            placeholder="Write your comment..."
            className="app-input"
          />
          <button type="submit" className="app-btn-secondary">
            Add Comment
          </button>
        </form>
      </section>
    </div>
  );
}
