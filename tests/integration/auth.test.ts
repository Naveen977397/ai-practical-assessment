import { authenticateUser, registerUser } from "@/lib/services/auth.service";
import { ValidationError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import {
  disconnectTestPrisma,
  resetTestDatabase,
} from "../helpers/test-db";

describe("Auth integration", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestPrisma();
  });

  it("authenticates with valid credentials", async () => {
    await prisma.user.create({
      data: {
        name: "Auth User",
        email: "auth@test.com",
        role: "Agent",
        passwordHash: hashPassword("Password123!"),
      },
    });

    const result = await authenticateUser({
      email: "auth@test.com",
      password: "Password123!",
    });

    expect(result.user.email).toBe("auth@test.com");
    expect(result.token).toBeTruthy();
  });

  it("rejects invalid password", async () => {
    await prisma.user.create({
      data: {
        name: "Auth User",
        email: "auth@test.com",
        role: "Agent",
        passwordHash: hashPassword("Password123!"),
      },
    });

    await expect(
      authenticateUser({
        email: "auth@test.com",
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("registers a new user with Requester role", async () => {
    const result = await registerUser({
      name: "New User",
      email: "newuser@test.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    });

    expect(result.user.email).toBe("newuser@test.com");
    expect(result.user.role).toBe("Requester");
    expect(result.token).toBeTruthy();

    const login = await authenticateUser({
      email: "newuser@test.com",
      password: "Password123!",
    });
    expect(login.user.id).toBe(result.user.id);
  });

  it("rejects duplicate email on signup", async () => {
    await registerUser({
      name: "First User",
      email: "duplicate@test.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    });

    await expect(
      registerUser({
        name: "Second User",
        email: "duplicate@test.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
