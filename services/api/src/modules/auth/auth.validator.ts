import { z } from "zod";

import { ROLES } from "../../constants/roles";

const emailSchema = z.string().trim().toLowerCase().email();
const fullNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .transform((value) => value.trim());

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  full_name: fullNameSchema.optional(),
  fullName: fullNameSchema.optional(),
  phone: z.string().trim().optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

export const adminCreateUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: fullNameSchema.optional(),
  role: z
    .enum([ROLES.CUSTOMER, ROLES.SALES, ROLES.TECHNICIAN, ROLES.ADMIN])
    .default(ROLES.CUSTOMER)
});
