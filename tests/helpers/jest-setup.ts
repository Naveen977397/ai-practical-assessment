import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const testDbPath = path.join(__dirname, "../../src/test.db");
process.env.DATABASE_URL = `file:${testDbPath}`;
process.env.JWT_SECRET =
  process.env.JWT_SECRET ??
  "test-jwt-secret-for-integration-tests-min-32-chars";

if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}

execSync("npx prisma migrate deploy", {
  cwd: path.join(__dirname, "../../src"),
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  stdio: "pipe",
});
