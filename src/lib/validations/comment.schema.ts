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

export const createCommentSchema = z.object({
  message: trimmedString(1, 2000, "Message"),
  createdById: z.string().min(1, "createdById is required"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
