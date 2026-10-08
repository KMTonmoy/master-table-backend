import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "Product id is required"),
  quantity: z.coerce.number().int().min(1).max(99).optional().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
});