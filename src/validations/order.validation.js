import { z } from "zod";

export const createOrderSchema = z.object({
  customer: z.string().trim().optional(),
  email: z.string().trim().toLowerCase().email("A valid email is required").optional(),
  channel: z.string().trim().min(1, "Channel is required"),
  table: z.string().trim().optional().nullable(),
  items: z.array(z.string()).min(1, "Order must contain at least one item"),
  payment: z.string().trim().optional(),
  addressId: z.string().trim().optional().nullable(),
  address: z
    .object({
      id: z.string().optional(),
      label: z.string().optional(),
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional()
    .nullable(),
  phone: z.string().trim().optional().nullable(),
});

export const updateOrderSchema = z
  .object({
    status: z.enum(["Pending", "Preparing", "Shipped", "Delivered", "Cancelled"]).optional(),
    payment: z.string().optional(),
    table: z.string().nullable().optional(),
    customer: z.string().optional(),
    channel: z.string().optional(),
    items: z.array(z.string()).optional(),
    phone: z.string().nullable().optional(),
    address: z.object({}).passthrough().nullable().optional(),
    addressId: z.string().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "No fields provided");