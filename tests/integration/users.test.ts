import { Priority, TicketStatus } from "@/app/generated/prisma";
import { ValidationError } from "@/lib/api/errors";
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/lib/services/user.service";
import {
  createTestTicket,
  disconnectTestPrisma,
  resetTestDatabase,
  seedTestUsers,
} from "../helpers/test-db";

describe("User CRUD integration", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestPrisma();
  });

  it("creates a user", async () => {
    const user = await createUser({
      name: "New User",
      email: "new.user@test.com",
      role: "Agent",
      password: "Password123!",
    });

    expect(user.name).toBe("New User");
    expect(user.email).toBe("new.user@test.com");
  });

  it("rejects duplicate email", async () => {
    await createUser({
      name: "First",
      email: "dup@test.com",
      role: "Agent",
      password: "Password123!",
    });

    await expect(
      createUser({
        name: "Second",
        email: "dup@test.com",
        role: "Requester",
        password: "Password123!",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("updates a user", async () => {
    const user = await createUser({
      name: "Original",
      email: "update@test.com",
      role: "Agent",
      password: "Password123!",
    });

    const updated = await updateUser(user.id, { name: "Updated Name" });
    expect(updated.name).toBe("Updated Name");
  });

  it("prevents delete when user has tickets", async () => {
    const { creator } = await seedTestUsers();
    await createTestTicket(creator.id);

    await expect(deleteUser(creator.id)).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("deletes user without tickets or comments", async () => {
    const user = await createUser({
      name: "Deletable",
      email: "delete@test.com",
      role: "Agent",
      password: "Password123!",
    });

    await expect(deleteUser(user.id)).resolves.toBeUndefined();
  });
});
