import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  price: z.coerce.number().positive("Invalid price"),
});

export const createPaymentSchema = z.object({}).passthrough();