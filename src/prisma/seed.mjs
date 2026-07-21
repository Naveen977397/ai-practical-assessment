import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/index.js";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

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
      update: { name: user.name, role: user.role },
      create: user,
    });
  }

  const count = await prisma.user.count();
  console.log(`Seed completed: ${count} users`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
