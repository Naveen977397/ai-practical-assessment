import { NotFoundError, ValidationError } from "@/lib/api/errors";
import { commentInclude } from "@/lib/db/includes";
import { prisma } from "@/lib/prisma";
import type { CreateCommentInput } from "@/lib/validations/comment.schema";

async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ValidationError(`User not found: ${userId}`);
  }
}

export async function addComment(ticketId: string, input: CreateCommentInput) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }

  await ensureUserExists(input.createdById);

  return prisma.comment.create({
    data: {
      ticketId,
      message: input.message,
      createdById: input.createdById,
    },
    include: commentInclude,
  });
}
