import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma";
import { InvalidStatusTransitionError } from "@/lib/ticket-state-machine";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details !== undefined ? { details } : {}) },
    { status },
  );
}

export function handleServiceError(error: unknown) {
  if (error instanceof NotFoundError) {
    return jsonError(error.message, 404);
  }

  if (error instanceof ValidationError) {
    return jsonError(error.message, 400);
  }

  if (error instanceof UnauthorizedError) {
    return jsonError(error.message, 401);
  }

  if (error instanceof ForbiddenError) {
    return jsonError(error.message, 403);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(error);
    return jsonError(
      "Database connection error. Stop the dev server, run `npm rebuild better-sqlite3`, then restart.",
      503,
    );
  }

  if (
    error instanceof Error &&
    (error.message.includes("better_sqlite3") ||
      error.message.includes("did not self-register"))
  ) {
    console.error(error);
    return jsonError(
      "Database module error. Stop the dev server, run `npm rebuild better-sqlite3`, then restart.",
      503,
    );
  }

  if (error instanceof InvalidStatusTransitionError) {
    return jsonError(error.message, 409);
  }

  console.error(error);
  return jsonError("Internal server error", 500);
}
