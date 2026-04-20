import { Request, Response } from "express";

import { prisma } from "../../config/prisma";
import { ROLES } from "../../constants/roles";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";
import {
  createCompatibilityRule,
  findCompatibilityRuleById,
  getActiveRulesByCategories,
  getCategoriesWithProducts,
  getProductsForCheck,
  listCompatibilityRules,
  updateCompatibilityRule
} from "./pc-builder.repository";
import {
  compatibilityCheckSchema,
  createCompatibilityRuleSchema,
  updateCompatibilityRuleSchema
} from "./pc-builder.validator";

type CheckedProduct = {
  id: string;
  name: string;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  attributes: Array<{ key: string; value: string }>;
};

function getAttributeValue(
  attributes: Array<{ key: string; value: string }>,
  key: string
): string | undefined {
  return attributes.find((attr) => attr.key === key)?.value;
}

export const getBuilderOptions = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await getCategoriesWithProducts();

  res.status(200).json({
    success: true,
    data: categories
  });
});

export const checkCompatibility = asyncHandler(async (req: Request, res: Response) => {
  const payload = compatibilityCheckSchema.parse(req.body);
  const products = (await getProductsForCheck(payload.productIds)) as CheckedProduct[];

  if (products.length !== payload.productIds.length) {
    throw new AppError("One or more products not found or inactive", 404);
  }

  const categoryIds: string[] = [...new Set(products.map((p: CheckedProduct) => p.categoryId))];
  const rules = await getActiveRulesByCategories(categoryIds);

  const byCategory = new Map<string, CheckedProduct[]>();
  for (const p of products) {
    if (!byCategory.has(p.categoryId)) {
      byCategory.set(p.categoryId, []);
    }
    byCategory.get(p.categoryId)?.push(p);
  }

  const issues: Array<{
    ruleId: string;
    sourceProductId: string;
    targetProductId: string;
    message: string;
    sourceCategory: string;
    targetCategory: string;
  }> = [];

  for (const rule of rules) {
    const sourceProducts = byCategory.get(rule.sourceCategoryId) || [];
    const targetProducts = byCategory.get(rule.targetCategoryId) || [];

    for (const source of sourceProducts) {
      for (const target of targetProducts) {
        const sourceValue = getAttributeValue(source.attributes, rule.sourceAttributeKey);
        const targetValue = getAttributeValue(target.attributes, rule.targetAttributeKey);

        if (!sourceValue || !targetValue) {
          continue;
        }

        const passed =
          rule.operator === "EQ" ? sourceValue === targetValue : sourceValue !== targetValue;

        if (!passed) {
          issues.push({
            ruleId: rule.id,
            sourceProductId: source.id,
            targetProductId: target.id,
            sourceCategory: rule.sourceCategory.name,
            targetCategory: rule.targetCategory.name,
            message: `Incompatible: ${source.name} (${rule.sourceAttributeKey}=${sourceValue}) and ${target.name} (${rule.targetAttributeKey}=${targetValue})`
          });
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      compatible: issues.length === 0,
      selectedProducts: products,
      issues
    }
  });
});

export const getCompatibilityRules = asyncHandler(async (_req: Request, res: Response) => {
  const rules = await listCompatibilityRules();

  res.status(200).json({
    success: true,
    data: rules
  });
});

export const postCompatibilityRule = asyncHandler(async (req: Request, res: Response) => {
  const payload = createCompatibilityRuleSchema.parse(req.body);

  if (payload.sourceCategoryId === payload.targetCategoryId) {
    throw new AppError("Source and target category must be different", 400);
  }

  const [sourceCategory, targetCategory] = await Promise.all([
    prisma.category.findUnique({ where: { id: payload.sourceCategoryId } }),
    prisma.category.findUnique({ where: { id: payload.targetCategoryId } })
  ]);

  if (!sourceCategory || !targetCategory) {
    throw new AppError("Category not found", 404);
  }

  const created = await createCompatibilityRule(payload);

  res.status(201).json({
    success: true,
    data: created
  });
});

export const patchCompatibilityRule = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateCompatibilityRuleSchema.parse(req.body);

  const existing = await findCompatibilityRuleById(req.params.ruleId);
  if (!existing) {
    throw new AppError("Compatibility rule not found", 404);
  }

  const updated = await updateCompatibilityRule(req.params.ruleId, payload);

  res.status(200).json({
    success: true,
    data: updated
  });
});

export const pcBuilderManageRoles = [ROLES.ADMIN, ROLES.TECHNICIAN];
