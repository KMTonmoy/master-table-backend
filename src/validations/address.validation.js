import { z } from "zod";

export const addressInputSchema = z.object({
  label: z.string().trim().optional().default(""),
  line1: z.string().trim().min(1, "Address line 1 is required"),
  line2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1, "City is required"),
  postalCode: z.string().trim().optional().default(""),
  country: z.string().trim().optional().default(""),
  phone: z.string().trim().min(5, "Phone number is required"),
  isDefault: z.boolean().optional(),
});

export const addressUpdateSchema = addressInputSchema.partial();