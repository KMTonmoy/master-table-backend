import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  city: z.string().trim().optional().default(""),
});