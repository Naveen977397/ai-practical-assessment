import { TicketStatus } from "@/app/generated/prisma";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

const TEST_PASSWORD_HASH = hashPassword("test-password-123");

export async function resetTestDatabase() {
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedTestUsers() {
  const creator = await prisma.user.create({
    data: {
      name: "Test Creator",
      email: `creator-${Date.now()}@test.com`,
      role: "Requester",
      passwordHash: TEST_PASSWORD_HASH,
    },
  });
  const agent = await prisma.user.create({
    data: {
      name: "Test Agent",
      email: `agent-${Date.now()}@test.com`,
      role: "Agent",
      passwordHash: TEST_PASSWORD_HASH,
    },
  });
  return { creator, agent };
}

export async function createTestTicket(
  createdById: string,
  status: TicketStatus = TicketStatus.OPEN,
) {
  return prisma.ticket.create({
    data: {
      title: "Test ticket",
      description: "Test description",
      priority: "MEDIUM",
      status,
      createdById,
    },
  });
}

export async function disconnectTestPrisma() {
  await prisma.$disconnect();
}
