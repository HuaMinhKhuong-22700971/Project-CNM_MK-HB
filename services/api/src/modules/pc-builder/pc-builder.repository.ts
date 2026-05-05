import { prisma } from "../../config/prisma";

export function getCategoriesWithProducts() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      Product: {
        where: { is_active: true },
        select: {
          id: true,
          name: true,
          price: true,
          category_id: true,
          ProductSku: {
            take: 1,
            select: { id: true, sku: true, price: true, stock: true, image_url: true }
          }
        },
        orderBy: { name: "asc" }
      }
    }
  });
}

export function getProductsForCheck(productIds: (string | number)[]) {
  const ids = productIds.map((id) => (typeof id === "string" ? parseInt(id, 10) : id));
  return prisma.product.findMany({
    where: {
      id: { in: ids },
      is_active: true
    },
    include: {
      Category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

export function getActiveRulesByCategories(categoryIds: (string | number)[]) {
  const ids = categoryIds.map((id) => (typeof id === "string" ? parseInt(id, 10) : id));
  return prisma.compatibilityRule.findMany({
    where: {
      is_active: true,
      source_category_id: { in: ids },
      target_category_id: { in: ids }
    },
    orderBy: [{ source_category_id: "asc" }, { target_category_id: "asc" }]
  });
}

export function listCompatibilityRules() {
  return prisma.compatibilityRule.findMany({
    orderBy: { created_at: "desc" }
  });
}

export function findCompatibilityRuleById(id: string | number) {
  return prisma.compatibilityRule.findUnique({
    where: { id: typeof id === "string" ? parseInt(id, 10) : id }
  });
}

export function createCompatibilityRule(data: {
  sourceCategoryId: string | number;
  targetCategoryId: string | number;
  sourceAttributeKey: string;
  targetAttributeKey: string;
  operator: "EQ" | "NEQ";
  description?: string;
  isActive?: boolean;
}) {
  return prisma.compatibilityRule.create({
    data: {
      source_category_id: typeof data.sourceCategoryId === "string" ? parseInt(data.sourceCategoryId, 10) : data.sourceCategoryId,
      target_category_id: typeof data.targetCategoryId === "string" ? parseInt(data.targetCategoryId, 10) : data.targetCategoryId,
      source_attribute_key: data.sourceAttributeKey,
      target_attribute_key: data.targetAttributeKey,
      operator: data.operator,
      description: data.description,
      is_active: data.isActive ?? true
    }
  });
}

export function updateCompatibilityRule(
  id: string | number,
  data: Partial<{
    sourceCategoryId: string | number;
    targetCategoryId: string | number;
    sourceAttributeKey: string;
    targetAttributeKey: string;
    operator: "EQ" | "NEQ";
    description: string;
    isActive: boolean;
  }>
) {
  const finalId = typeof id === "string" ? parseInt(id, 10) : id;
  return prisma.compatibilityRule.update({
    where: { id: finalId },
    data: {
      ...(data.sourceCategoryId !== undefined ? { source_category_id: Number(data.sourceCategoryId) } : {}),
      ...(data.targetCategoryId !== undefined ? { target_category_id: Number(data.targetCategoryId) } : {}),
      ...(data.sourceAttributeKey !== undefined ? { source_attribute_key: data.sourceAttributeKey } : {}),
      ...(data.targetAttributeKey !== undefined ? { target_attribute_key: data.targetAttributeKey } : {}),
      ...(data.operator !== undefined ? { operator: data.operator } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.isActive !== undefined ? { is_active: data.isActive } : {})
    }
  });
}
