import { z } from "zod";

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["COD", "VNPAY"]).default("COD"),
  shippingAddress: z.string().trim().min(10).max(1000)
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELED"])
});
