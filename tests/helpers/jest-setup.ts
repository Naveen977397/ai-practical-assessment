import path from "path";
import { execSync } from "child_process";

const testDbPath = path.join(__dirname, "../../src/test.db");
process.env.DATABASE_URL = `file:${testDbPath}`;

execSync("npx prisma db push", {
  cwd: path.join(__dirname, "../../src"),
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  stdio: "pipe",
});
