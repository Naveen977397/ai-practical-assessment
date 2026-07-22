import { NextRequest, NextResponse } from "next/server";
import { handleServiceError } from "@/lib/api/errors";
import { parseJsonBody } from "@/lib/api/validation";
import { AUTH_COOKIE_NAME } from "@/lib/auth/config";
import { authenticateUser } from "@/lib/services/auth.service";
import { loginSchema } from "@/lib/validations/auth.schema";

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJsonBody(request, loginSchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const { token, user } = await authenticateUser(parsed.data);
    const response = NextResponse.json({ user });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    return handleServiceError(error);
  }
}
