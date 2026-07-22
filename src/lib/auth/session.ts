import { cookies } from "next/headers";
import { UnauthorizedError, ForbiddenError } from "@/lib/api/errors";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const payload = await verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new UnauthorizedError("Authentication required");
  }
  return user;
}

export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError("Insufficient permissions");
  }
  return user;
}
