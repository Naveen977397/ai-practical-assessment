import { ValidationError } from "@/lib/api/errors";
import { verifyPassword } from "@/lib/auth/password";
import { signAuthToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";
import { createUser } from "@/lib/services/user.service";
import type { LoginInput, SignupInput } from "@/lib/validations/auth.schema";

const DEFAULT_SIGNUP_ROLE = "Requester";

export async function authenticateUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user || !user.passwordHash) {
    throw new ValidationError("Invalid email or password");
  }

  const valid = verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new ValidationError("Invalid email or password");
  }

  const token = await signAuthToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function registerUser(input: SignupInput) {
  const user = await createUser({
    name: input.name,
    email: input.email,
    password: input.password,
    role: DEFAULT_SIGNUP_ROLE,
  });

  const token = await signAuthToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return { token, user };
}
