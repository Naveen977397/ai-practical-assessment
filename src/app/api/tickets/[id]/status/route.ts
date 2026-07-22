import { NextRequest, NextResponse } from "next/server";
import { handleServiceError } from "@/lib/api/errors";
import { parseJsonBody } from "@/lib/api/validation";
import { requireAuth } from "@/lib/auth/session";
import { transitionTicketStatus } from "@/lib/services/ticket.service";
import { transitionStatusSchema } from "@/lib/validations/ticket.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAuth();
    const { id } = await context.params;
    const parsed = await parseJsonBody(request, transitionStatusSchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const ticket = await transitionTicketStatus(id, parsed.data);
    return NextResponse.json(ticket);
  } catch (error) {
    return handleServiceError(error);
  }
}
