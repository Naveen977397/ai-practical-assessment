import { NextRequest, NextResponse } from "next/server";
import { jsonError, handleServiceError } from "@/lib/api/errors";
import { validationErrorResponse } from "@/lib/api/validation";
import { requireAuth } from "@/lib/auth/session";
import {
  getTicketById,
  updateTicket,
} from "@/lib/services/ticket.service";
import { updateTicketSchema } from "@/lib/validations/ticket.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireAuth();
    const { id } = await context.params;
    const ticket = await getTicketById(id);
    return NextResponse.json(ticket);
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAuth();
    const { id } = await context.params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    if (body && typeof body === "object" && "status" in body) {
      return jsonError(
        "Status cannot be updated via this endpoint. Use /status instead.",
        400,
      );
    }

    const parsed = updateTicketSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const ticket = await updateTicket(id, parsed.data);
    return NextResponse.json(ticket);
  } catch (error) {
    return handleServiceError(error);
  }
}
