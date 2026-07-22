import { NextRequest, NextResponse } from "next/server";
import { handleServiceError } from "@/lib/api/errors";
import { parseJsonBody } from "@/lib/api/validation";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { createUser, listUsers } from "@/lib/services/user.service";
import { createUserSchema } from "@/lib/validations/user.schema";

export async function GET() {
  try {
    await requireAuth();
    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("Admin");
    const parsed = await parseJsonBody(request, createUserSchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const user = await createUser(parsed.data);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
