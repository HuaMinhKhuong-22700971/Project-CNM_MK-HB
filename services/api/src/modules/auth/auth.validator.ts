import { z } from "zod";

import { ROLES } from "../../constants/roles";

const emailSchema = z.string().trim().toLowerCase().email();
const fullNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .transform((value) => value.trim());
const phoneSchema = z
  .string()
  .trim()
  .regex(/^(0|\+84)(\d{9,10})$/, "Số điện thoại Việt Nam không hợp lệ");

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  full_name: fullNameSchema.optional(),
  fullName: fullNameSchema.optional(),
  phone: phoneSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required")
});

export const adminCreateUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  fullName: fullNameSchema.optional(),
  role: z
    .enum([ROLES.CUSTOMER, ROLES.SALES, ROLES.TECHNICIAN, ROLES.ADMIN])
    .default(ROLES.CUSTOMER)
});

