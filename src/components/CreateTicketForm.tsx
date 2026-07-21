"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Priority } from "@/app/generated/prisma";
import { useActingUser } from "@/components/ActingUserProvider";
import { BackToTicketsLink } from "@/components/BackToTicketsLink";
import { ErrorBanner } from "@/components/ui/badges";
import { PRIORITY_LABELS } from "@/lib/constants";

type UserOption = { id: string; name: string };

export function CreateTicketForm() {
  const router = useRouter();
  const { actingUser } = useActingUser();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [assignedToId, setAssignedToId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => setError("Failed to load users"));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!actingUser) {
      setError("Select an acting user before creating a ticket.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          createdById: actingUser.id,
          assignedToId: assignedToId || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create ticket");
      }

      router.push(`/tickets/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <BackToTicketsLink />
        <h1 className="app-page-title mt-3">New Ticket</h1>
        <p className="mt-1 app-muted">Create a new support request</p>
      </div>

      <form onSubmit={handleSubmit} className="app-card space-y-5">
        {error && <ErrorBanner message={error} />}

        <div>
          <label htmlFor="title" className="app-label">
            Title
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="app-input"
          />
        </div>

        <div>
          <label htmlFor="description" className="app-label">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="app-input"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="priority" className="app-label">
              Priority
            </label>
            <select
              id="priority"
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
            <label htmlFor="assignee" className="app-label">
              Assignee (optional)
            </label>
            <select
              id="assignee"
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

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
          <button type="submit" disabled={submitting} className="app-btn-primary">
            {submitting ? "Creating..." : "Create Ticket"}
          </button>
          <Link href="/tickets" className="app-btn-secondary text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
