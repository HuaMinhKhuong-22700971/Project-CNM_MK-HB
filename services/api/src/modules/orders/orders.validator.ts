import { z } from "zod";

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["COD", "VNPAY"]).default("COD"),
  shippingAddress: z.string().trim().min(10).max(1000),
  addressId: z.coerce.number().int().positive().optional(),
  shippingFee: z.coerce.number().min(0).default(0),
  note: z.string().trim().max(1000).optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"])
});
