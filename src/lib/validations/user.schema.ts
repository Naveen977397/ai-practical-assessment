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

export const createUserSchema = z.object({
  name: trimmedString(1, 100, "Name"),
  email: z
    .string()
    .email("Invalid email address")
    .transform((value) => value.trim().toLowerCase()),
  role: trimmedString(1, 50, "Role"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateUserSchema = z
  .object({
    name: trimmedString(1, 100, "Name").optional(),
    email: z
      .string()
      .email("Invalid email address")
      .transform((value) => value.trim().toLowerCase())
      .optional(),
    role: trimmedString(1, 50, "Role").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
