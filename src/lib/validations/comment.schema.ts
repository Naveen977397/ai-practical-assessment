import { z } from "zod";

const trimmedString = (min: number, max: number, label: string) =>
  z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length >= min, `${label} is required`)
    .refine(
      (value) => value.length <= max,
      `${label} must be at most ${max} characters`,
    );

export const createCommentBodySchema = z.object({
  message: trimmedString(1, 2000, "Message"),
});

export const createCommentSchema = createCommentBodySchema.extend({
  createdById: z.string().min(1, "createdById is required"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
