import { z } from "zod";

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
    profileImage: z.string().trim().optional(),
    phone: z.string().trim().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "No fields provided");

export const createUserSchema = z.object({
  name: z.string().trim().optional().default(""),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().nullable(),
  role: z.enum(["user", "admin"]),
});

export const updateRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export const updatePhoneSchema = z.object({
  phone: z.string().trim().min(5, "A valid phone number is required"),
});