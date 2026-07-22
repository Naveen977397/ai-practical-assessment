import { Prisma } from "@/app/generated/prisma";
import { NotFoundError, ValidationError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/validations/user.schema";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: userSelect,
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function createUser(input: CreateUserInput) {
  const { password, ...data } = input;

  try {
    return await prisma.user.create({
      data: {
        ...data,
        passwordHash: hashPassword(password),
      },
      select: userSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ValidationError("A user with this email already exists");
    }
    throw error;
  }
}

export async function updateUser(id: string, input: UpdateUserInput) {
  await getUserById(id);

  const { password, ...data } = input;
  const updateData: Prisma.UserUpdateInput = { ...data };

  if (password) {
    updateData.passwordHash = hashPassword(password);
  }

  try {
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ValidationError("A user with this email already exists");
    }
    throw error;
  }
}

export async function deleteUser(id: string) {
  await getUserById(id);

  const [createdTickets, comments] = await Promise.all([
    prisma.ticket.count({ where: { createdById: id } }),
    prisma.comment.count({ where: { createdById: id } }),
  ]);

  if (createdTickets > 0 || comments > 0) {
    throw new ValidationError(
      "Cannot delete user with existing tickets or comments",
    );
  }

  await prisma.user.delete({ where: { id } });
}
