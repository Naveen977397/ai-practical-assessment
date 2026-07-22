import { NextRequest, NextResponse } from "next/server";
import { handleServiceError } from "@/lib/api/errors";
import { parseJsonBody } from "@/lib/api/validation";
import { requireAuth, requireRole } from "@/lib/auth/session";
import {
  deleteUser,
  getUserById,
  updateUser,
} from "@/lib/services/user.service";
import { updateUserSchema } from "@/lib/validations/user.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireAuth();
    const { id } = await context.params;
    const user = await getUserById(id);
    return NextResponse.json(user);
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole("Admin");
    const { id } = await context.params;
    const parsed = await parseJsonBody(request, updateUserSchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const user = await updateUser(id, parsed.data);
    return NextResponse.json(user);
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("Admin");
    const { id } = await context.params;
    await deleteUser(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleServiceError(error);
  }
}
