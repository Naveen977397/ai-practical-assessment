import { TicketStatus } from "@/app/generated/prisma";
import { addComment } from "@/lib/services/comment.service";
import { transitionTicketStatus } from "@/lib/services/ticket.service";
import { createCommentSchema } from "@/lib/validations/comment.schema";
import {
  createTestTicket,
  disconnectTestPrisma,
  resetTestDatabase,
  seedTestUsers,
} from "../helpers/test-db";

describe("Comment API integration", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestPrisma();
  });

  it("adds a comment to an existing ticket", async () => {
    const { creator } = await seedTestUsers();
    const ticket = await createTestTicket(creator.id);

    const comment = await addComment(ticket.id, {
      message: "Investigating the issue now.",
      createdById: creator.id,
    });

    expect(comment.message).toBe("Investigating the issue now.");
    expect(comment.createdBy.id).toBe(creator.id);
  });

  it("rejects empty comment messages via validation schema", () => {
    const result = createCommentSchema.safeParse({
      message: "   ",
      createdById: "user-id",
    });

    expect(result.success).toBe(false);
  });

  it("allows comments on closed tickets", async () => {
    const { creator } = await seedTestUsers();
    const ticket = await createTestTicket(creator.id);

    await transitionTicketStatus(ticket.id, {
      status: TicketStatus.IN_PROGRESS,
    });
    await transitionTicketStatus(ticket.id, { status: TicketStatus.RESOLVED });
    await transitionTicketStatus(ticket.id, { status: TicketStatus.CLOSED });

    const comment = await addComment(ticket.id, {
      message: "Closing notes added.",
      createdById: creator.id,
    });

    expect(comment.message).toBe("Closing notes added.");
  });

  it("throws when ticket does not exist", async () => {
    const { creator } = await seedTestUsers();

    await expect(
      addComment("non-existent-id", {
        message: "Test",
        createdById: creator.id,
      }),
    ).rejects.toThrow("Ticket not found");
  });
});
