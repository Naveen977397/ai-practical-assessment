import { NextResponse } from "next/server";
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

  if (error instanceof InvalidStatusTransitionError) {
    return jsonError(error.message, 409);
  }

  console.error(error);
  return jsonError("Internal server error", 500);
}
