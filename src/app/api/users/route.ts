import { NextResponse } from "next/server";
import { handleServiceError } from "@/lib/api/errors";
import { listUsers } from "@/lib/services/user.service";

export async function GET() {
  try {
    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error) {
    return handleServiceError(error);
  }
}
