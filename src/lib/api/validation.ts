import { NextResponse } from "next/server";
import type { ZodError, ZodSchema } from "zod";

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { error: "Validation failed", details: error.flatten() },
    { status: 400 },
  );
}

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return { success: false, response: validationErrorResponse(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export function parseQueryParams<T>(
  params: Record<string, string>,
  schema: ZodSchema<T>,
): { success: true; data: T } | { success: false; response: NextResponse } {
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: parsed.data };
}
