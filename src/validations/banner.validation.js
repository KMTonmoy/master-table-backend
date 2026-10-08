import { z } from "zod";

export const createBannerSchema = z.object({
  image: z.string().trim().min(1, "Image is required"),
  heading: z.string().trim().min(1, "Heading is required"),
  description: z.string().trim().min(1, "Description is required"),
});

export const updateBannerSchema = z
  .object({
    image: z.string().trim().min(1).optional(),
    heading: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "No fields provided");