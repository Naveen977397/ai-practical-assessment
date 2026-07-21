import { NextRequest, NextResponse } from "next/server";
import { handleServiceError } from "@/lib/api/errors";
import { parseJsonBody, parseQueryParams } from "@/lib/api/validation";
import {
  createTicket,
  listTickets,
} from "@/lib/services/ticket.service";
import {
  createTicketSchema,
  listTicketsQuerySchema,
} from "@/lib/validations/ticket.schema";

export async function GET(request: NextRequest) {
  try {
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
    const parsed = await parseJsonBody(request, createTicketSchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const ticket = await createTicket(parsed.data);
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
