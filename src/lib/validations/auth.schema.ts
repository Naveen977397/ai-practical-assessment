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

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name: trimmedString(1, 100, "Name"),
    email: z
      .string()
      .email("Invalid email address")
      .transform((value) => value.trim().toLowerCase()),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
