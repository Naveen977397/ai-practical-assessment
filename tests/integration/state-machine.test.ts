import { TicketStatus } from "@/app/generated/prisma";
import { InvalidStatusTransitionError } from "@/lib/ticket-state-machine";
import { transitionTicketStatus } from "@/lib/services/ticket.service";
import {
  createTestTicket,
  disconnectTestPrisma,
  resetTestDatabase,
  seedTestUsers,
} from "../helpers/test-db";

describe("Ticket status state machine integration", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestPrisma();
  });

  describe("valid transitions", () => {
    it.each([
      [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
      [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
      [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      [TicketStatus.CLOSED, TicketStatus.OPEN],
      [TicketStatus.OPEN, TicketStatus.CANCELLED],
      [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
    ])("allows %s → %s", async (from, to) => {
      const { creator } = await seedTestUsers();
      const ticket = await createTestTicket(creator.id, from);

      const updated = await transitionTicketStatus(ticket.id, { status: to });

      expect(updated.status).toBe(to);
    });
  });

  describe("invalid transitions", () => {
    it.each([
      [TicketStatus.OPEN, TicketStatus.RESOLVED],
      [TicketStatus.OPEN, TicketStatus.CLOSED],
      [TicketStatus.IN_PROGRESS, TicketStatus.OPEN],
      [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
      [TicketStatus.RESOLVED, TicketStatus.CANCELLED],
      [TicketStatus.RESOLVED, TicketStatus.OPEN],
      [TicketStatus.CANCELLED, TicketStatus.OPEN],
    ])("rejects %s → %s", async (from, to) => {
      const { creator } = await seedTestUsers();
      const ticket = await createTestTicket(creator.id, from);

      await expect(
        transitionTicketStatus(ticket.id, { status: to }),
      ).rejects.toBeInstanceOf(InvalidStatusTransitionError);
    });
  });
});
