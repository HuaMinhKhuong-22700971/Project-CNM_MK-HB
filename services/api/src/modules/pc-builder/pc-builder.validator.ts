import { z } from "zod";

export const compatibilityCheckSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(20)
});

export const createCompatibilityRuleSchema = z.object({
  sourceCategoryId: z.string().min(1),
  targetCategoryId: z.string().min(1),
  sourceAttributeKey: z.string().trim().min(1).max(100),
  targetAttributeKey: z.string().trim().min(1).max(100),
  operator: z.enum(["EQ", "NEQ"]).default("EQ"),
  description: z.string().trim().max(2000).optional(),
  isActive: z.boolean().optional().default(true)
});

export const updateCompatibilityRuleSchema = createCompatibilityRuleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  });
