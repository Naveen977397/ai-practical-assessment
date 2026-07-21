import { NextRequest, NextResponse } from "next/server";
import { handleServiceError } from "@/lib/api/errors";
import { parseJsonBody } from "@/lib/api/validation";
import { addComment } from "@/lib/services/comment.service";
import { createCommentSchema } from "@/lib/validations/comment.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const parsed = await parseJsonBody(request, createCommentSchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const comment = await addComment(id, parsed.data);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
