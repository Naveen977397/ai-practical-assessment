import { NextRequest, NextResponse } from "next/server";
import { handleServiceError } from "@/lib/api/errors";
import { parseJsonBody, parseQueryParams } from "@/lib/api/validation";
import { requireAuth } from "@/lib/auth/session";
import {
  createTicket,
  listTickets,
} from "@/lib/services/ticket.service";
import {
  createTicketBodySchema,
  listTicketsQuerySchema,
} from "@/lib/validations/ticket.schema";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const parsed = parseQueryParams(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
      listTicketsQuerySchema,
    );

    if (!parsed.success) {
      return parsed.response;
    }

    const tickets = await listTickets(parsed.data);
    return NextResponse.json(tickets);
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const parsed = await parseJsonBody(request, createTicketBodySchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const ticket = await createTicket({
      ...parsed.data,
      createdById: user.id,
    });
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
