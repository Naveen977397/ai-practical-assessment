import { Priority, TicketStatus } from "@/app/generated/prisma";

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export const STATUS_ACTION_LABELS: Partial<Record<TicketStatus, string>> = {
  OPEN: "Reopen",
  IN_PROGRESS: "Start Work",
  RESOLVED: "Resolve",
  CLOSED: "Close",
  CANCELLED: "Cancel",
};

export const ALL_STATUSES = Object.values(TicketStatus);
