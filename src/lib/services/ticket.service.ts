import { Prisma, TicketStatus } from "@/app/generated/prisma";
import { NotFoundError, ValidationError } from "@/lib/api/errors";
import { ticketDetailInclude, ticketInclude } from "@/lib/db/includes";
import { prisma } from "@/lib/prisma";
import { assertTransition } from "@/lib/ticket-state-machine";
import type {
  CreateTicketInput,
  ListTicketsQuery,
  TransitionStatusInput,
  UpdateTicketInput,
} from "@/lib/validations/ticket.schema";

async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ValidationError(`User not found: ${userId}`);
  }
}

async function ensureOptionalAssignee(assignedToId: string | null | undefined) {
  if (assignedToId) {
    await ensureUserExists(assignedToId);
  }
}

export async function listTickets(query: ListTicketsQuery) {
  const where: Prisma.TicketWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.q?.trim()) {
    const term = query.q.trim();
    where.OR = [
      { title: { contains: term } },
      { description: { contains: term } },
    ];
  }

  return prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: ticketInclude,
  });
}

export async function getTicketById(id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: ticketDetailInclude,
  });

  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }

  return ticket;
}

export async function createTicket(input: CreateTicketInput) {
  await ensureUserExists(input.createdById);
  await ensureOptionalAssignee(input.assignedToId ?? null);

  return prisma.ticket.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: TicketStatus.OPEN,
      createdById: input.createdById,
      assignedToId: input.assignedToId ?? null,
    },
    include: ticketInclude,
  });
}

export async function updateTicket(id: string, input: UpdateTicketInput) {
  const existing = await prisma.ticket.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError("Ticket not found");
  }

  if (input.assignedToId !== undefined) {
    await ensureOptionalAssignee(input.assignedToId);
  }

  return prisma.ticket.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assignedToId !== undefined
        ? { assignedToId: input.assignedToId }
        : {}),
    },
    include: ticketInclude,
  });
}

export async function transitionTicketStatus(
  id: string,
  input: TransitionStatusInput,
) {
  const existing = await prisma.ticket.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError("Ticket not found");
  }

  assertTransition(existing.status, input.status);

  return prisma.ticket.update({
    where: { id },
    data: { status: input.status },
    include: ticketInclude,
  });
}
