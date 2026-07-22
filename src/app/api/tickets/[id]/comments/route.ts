import { NextRequest, NextResponse } from "next/server";
import { handleServiceError } from "@/lib/api/errors";
import { parseJsonBody } from "@/lib/api/validation";
import { requireAuth } from "@/lib/auth/session";
import { addComment } from "@/lib/services/comment.service";
import { createCommentBodySchema } from "@/lib/validations/comment.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const parsed = await parseJsonBody(request, createCommentBodySchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const comment = await addComment(id, {
      ...parsed.data,
      createdById: user.id,
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
