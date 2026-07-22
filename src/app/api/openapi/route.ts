import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { requireAuth } from "@/lib/auth/session";
import { handleServiceError } from "@/lib/api/errors";

export async function GET() {
  try {
    await requireAuth();
    const specPath = join(process.cwd(), "openapi.yaml");
    const spec = readFileSync(specPath, "utf-8");
    return new NextResponse(spec, {
      headers: { "Content-Type": "application/yaml" },
    });
  } catch (error) {
    return handleServiceError(error);
  }
}
