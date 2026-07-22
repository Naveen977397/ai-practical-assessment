import { NextResponse } from "next/server";
import { handleServiceError } from "@/lib/api/errors";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return handleServiceError(error);
  }
}
