import { prisma } from "../../config/prisma";

type ProductListParams = {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  page: number;
  limit: number;
  sortBy: "createdAt" | "price" | "name";
  sortOrder: "asc" | "desc";
};

export function listCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });
}

export function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}) {
  return prisma.category.create({ data });
}

export async function listProducts(params: ProductListParams) {
  const { search, categorySlug, minPrice, maxPrice, isActive, page, limit, sortBy, sortOrder } = params;

  const where = {
    ...(typeof isActive === "boolean" ? { isActive } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
            { description: { contains: search } }
          ]
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(typeof minPrice === "number" || typeof maxPrice === "number"
      ? {
          price: {
            ...(typeof minPrice === "number" ? { gte: minPrice } : {}),
            ...(typeof maxPrice === "number" ? { lte: maxPrice } : {})
          }
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  return { items, total };
}

export function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
}

export function createProduct(data: {
  categoryId: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  isActive?: boolean;
}) {
  return prisma.product.create({ data });
}

export function updateProduct(
  id: string,
  data: Partial<{
    categoryId: string;
    sku: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    isActive: boolean;
  }>
) {
  return prisma.product.update({
    where: { id },
    data
  });
}

export function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export function getCategoryByName(name: string) {
  return prisma.category.findUnique({ where: { name } });
}

export function getProductBySku(sku: string) {
  return prisma.product.findUnique({ where: { sku } });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}
