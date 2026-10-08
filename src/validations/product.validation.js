import { z } from "zod";

const baseProduct = {
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z.string().trim().optional().default(""),
  category: z.string().trim().min(1, "Category is required"),
  price: z.coerce.number().nonnegative("Price must be positive"),
  stock: z.coerce.number().int().nonnegative().optional().default(0),
  sold: z.coerce.number().int().nonnegative().optional().default(0),
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  status: z
    .enum(["Active", "Draft", "Low stock", "Out of stock"])
    .optional()
    .default("Draft"),
  images: z.array(z.string()).optional().default([]),
  ingredients: z.array(z.string()).optional().default([]),
  diet: z.string().trim().optional().default(""),
  cuisine: z.string().trim().optional().default(""),
  spiceLevel: z.coerce.number().int().min(0).max(5).optional().default(0),
  prepTime: z.coerce.number().int().nonnegative().optional().default(0),
  calories: z.coerce.number().int().nonnegative().optional().default(0),
  tags: z.array(z.string()).optional().default([]),
  isFeatured: z.coerce.boolean().optional().default(false),
  isfeatured: z.coerce.boolean().optional(),
  isAvailable: z.coerce.boolean().optional().default(true),
};

export const createProductSchema = z.object(baseProduct);

export const createPublicProductSchema = z.object({
  ...baseProduct,
  diet: z.string().trim().min(1, "Diet is required"),
  status: z
    .enum(["Active", "Draft", "Low stock", "Out of stock"])
    .optional()
    .default("Active"),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().optional(),
    category: z.string().trim().optional(),
    price: z.coerce.number().nonnegative().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    sold: z.coerce.number().int().nonnegative().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    status: z.enum(["Active", "Draft", "Low stock", "Out of stock"]).optional(),
    images: z.array(z.string()).optional(),
    ingredients: z.array(z.string()).optional(),
    diet: z.string().trim().optional(),
    cuisine: z.string().trim().optional(),
    spiceLevel: z.coerce.number().int().min(0).max(5).optional(),
    prepTime: z.coerce.number().int().nonnegative().optional(),
    calories: z.coerce.number().int().nonnegative().optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.coerce.boolean().optional(),
    isfeatured: z.coerce.boolean().optional(),
    isAvailable: z.coerce.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "No fields provided");

export const replaceProductSchema = z.object({
  ...baseProduct,
  diet: z.string().trim().min(1, "Diet is required"),
  status: z
    .enum(["Active", "Draft", "Low stock", "Out of stock"])
    .optional()
    .default("Active"),
});