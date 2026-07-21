import { z } from "zod";
import { Priority, TicketStatus } from "@/app/generated/prisma";

const trimmedString = (min: number, max: number, label: string) =>
  z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length >= min, `${label} is required`)
    .refine(
      (value) => value.length <= max,
      `${label} must be at most ${max} characters`,
    );

export const createTicketSchema = z.object({
  title: trimmedString(1, 200, "Title"),
  description: trimmedString(1, 5000, "Description"),
  priority: z.nativeEnum(Priority),
  createdById: z.string().min(1, "createdById is required"),
  assignedToId: z.string().min(1).nullable().optional(),
});

export const updateTicketSchema = z
  .object({
    title: trimmedString(1, 200, "Title").optional(),
    description: trimmedString(1, 5000, "Description").optional(),
    priority: z.nativeEnum(Priority).optional(),
    assignedToId: z.string().min(1).nullable().optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const listTicketsQuerySchema = z.object({
  q: z.string().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
});

export const transitionStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
export type TransitionStatusInput = z.infer<typeof transitionStatusSchema>;
