import "dotenv/config";
import { randomBytes, scryptSync } from "crypto";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/index.js";

const DEFAULT_PASSWORD = "Password123!";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

const passwordHash = hashPassword(DEFAULT_PASSWORD);

const seedUsers = [
  {
    name: "Alice Admin",
    email: "alice.admin@support.local",
    role: "Admin",
  },
  {
    name: "Bob Agent",
    email: "bob.agent@support.local",
    role: "Agent",
  },
  {
    name: "Carol Requester",
    email: "carol.requester@support.local",
    role: "Requester",
  },
];

async function main() {
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: { ...user, passwordHash },
    });
  }

  const count = await prisma.user.count();
  console.log(`Seed completed: ${count} users (password: ${DEFAULT_PASSWORD})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
