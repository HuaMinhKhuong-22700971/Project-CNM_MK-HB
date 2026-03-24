import { z } from "zod";

export const listProductsQuerySchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
    sortBy: z.enum(["createdAt", "price", "name"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc")
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "minPrice must be less than or equal to maxPrice",
      path: ["minPrice"]
    }
  );

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/, "Slug only allows lowercase letters, numbers and '-'"),
  description: z.string().trim().max(5000).optional(),
  isActive: z.boolean().optional().default(true)
});

export const createProductSchema = z.object({
  categoryId: z.string().trim().min(1),
  sku: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug only allows lowercase letters, numbers and '-'"),
  description: z.string().trim().max(10000).optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().optional().default(true)
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  });
