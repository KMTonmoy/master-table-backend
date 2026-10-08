import { z } from "zod";

export const createReservationSchema = z.object({
  name: z.string().trim().min(2, "A valid name is required").optional(),
  email: z.string().trim().toLowerCase().email("A valid email is required").optional(),
  phone: z.string().trim().min(5, "A valid phone number is required"),
  date: z.string().trim().min(1, "Date is required"),
  time: z.string().trim().min(1, "Time is required"),
  guests: z.coerce.number().int().min(1).max(50),
  occasion: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default(""),
});

export const updateReservationSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    phone: z.string().trim().min(5).optional(),
    date: z.string().trim().optional(),
    time: z.string().trim().optional(),
    guests: z.coerce.number().int().min(1).max(50).optional(),
    occasion: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    status: z.enum(["Pending", "Confirmed", "Cancelled", "Completed"]).optional(),
    table: z.string().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "No fields provided");