import { prisma } from "../../config/prisma";

export function getCategoriesWithProducts() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { isActive: true },
        select: {
          id: true,
          sku: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          categoryId: true,
          attributes: {
            select: {
              key: true,
              value: true
            }
          }
        },
        orderBy: { name: "asc" }
      }
    }
  });
}

export function getProductsForCheck(productIds: string[]) {
  return prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      attributes: {
        select: {
          key: true,
          value: true
        }
      }
    }
  });
}

export function getActiveRulesByCategories(categoryIds: string[]) {
  return prisma.compatibilityRule.findMany({
    where: {
      isActive: true,
      sourceCategoryId: { in: categoryIds },
      targetCategoryId: { in: categoryIds }
    },
    include: {
      sourceCategory: { select: { id: true, name: true, slug: true } },
      targetCategory: { select: { id: true, name: true, slug: true } }
    },
    orderBy: [{ sourceCategoryId: "asc" }, { targetCategoryId: "asc" }]
  });
}

export function listCompatibilityRules() {
  return prisma.compatibilityRule.findMany({
    include: {
      sourceCategory: { select: { id: true, name: true, slug: true } },
      targetCategory: { select: { id: true, name: true, slug: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export function findCompatibilityRuleById(id: string) {
  return prisma.compatibilityRule.findUnique({ where: { id } });
}

export function createCompatibilityRule(data: {
  sourceCategoryId: string;
  targetCategoryId: string;
  sourceAttributeKey: string;
  targetAttributeKey: string;
  operator: "EQ" | "NEQ";
  description?: string;
  isActive?: boolean;
}) {
  return prisma.compatibilityRule.create({ data });
}

export function updateCompatibilityRule(
  id: string,
  data: Partial<{
    sourceCategoryId: string;
    targetCategoryId: string;
    sourceAttributeKey: string;
    targetAttributeKey: string;
    operator: "EQ" | "NEQ";
    description: string;
    isActive: boolean;
  }>
) {
  return prisma.compatibilityRule.update({
    where: { id },
    data
  });
}
