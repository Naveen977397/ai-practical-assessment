import { TicketStatus } from "@/app/generated/prisma";

const TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
  IN_PROGRESS: [TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  RESOLVED: [TicketStatus.CLOSED],
  CLOSED: [TicketStatus.OPEN],
  CANCELLED: [],
};

export class InvalidStatusTransitionError extends Error {
  constructor(from: TicketStatus, to: TicketStatus) {
    super(`Invalid status transition from ${from} to ${to}`);
    this.name = "InvalidStatusTransitionError";
  }
}

export function canTransition(
  from: TicketStatus,
  to: TicketStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function getValidTransitions(from: TicketStatus): TicketStatus[] {
  return [...TRANSITIONS[from]];
}

export function assertTransition(
  from: TicketStatus,
  to: TicketStatus,
): void {
  if (!canTransition(from, to)) {
    throw new InvalidStatusTransitionError(from, to);
  }
}
