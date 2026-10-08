import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name required"),
  description: z.string().trim().optional().default(""),
  image: z.string().trim().optional().default(""),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    image: z.string().trim().optional(),
    items: z.number().int().nonnegative().optional(),
    revenue: z.number().nonnegative().optional(),
    share: z.number().nonnegative().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "No fields provided");