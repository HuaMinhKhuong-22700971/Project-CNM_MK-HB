import { prisma } from "../../config/prisma";

type ProductListParams = {
  search?: string;
  categorySlug?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  page: number;
  limit: number;
  sortBy: "created_at" | "price" | "name";
  sortOrder: "asc" | "desc";
};

export function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" }
  });
}

export function createCategory(data: {
  name: string;
  description?: string;
  is_active?: boolean;
}) {
  return prisma.category.create({ data });
}

export async function listProducts(params: ProductListParams) {
  const { search, categorySlug, categoryId, minPrice, maxPrice, isActive, page, limit, sortBy, sortOrder } = params;

  const where: any = {
    ...(typeof isActive === "boolean" ? { is_active: isActive } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } }
          ]
        }
      : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
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
        Category: true,
        Brand: true,
        ProductSku: { take: 1 },
        ProductVariant: { take: 1 }
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

export async function getProductById(id: string | number) {
  let numericId: number;
  
  if (typeof id === "string") {
    numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;
  } else {
    numericId = Number(id);
  }

  return prisma.product.findUnique({
    where: { id: numericId },
    include: {
      Category: true,
      Brand: true,
      ProductSku: {
        include: {
          SkuAttribute: {
            include: {
              AttributeValue: {
                include: {
                  Attribute: true
                }
              }
            }
          }
        }
      },
      ProductVariant: true
    }
  });
}

export function createProduct(data: {
  category_id?: number;
  name: string;
  description?: string;
  price?: number;
  is_active?: boolean;
}) {
  return prisma.product.create({ data: data as any });
}

export function updateProduct(
  id: string | number,
  data: Partial<{
    category_id: number;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
  }>
) {
  const finalId = typeof id === "string" ? parseInt(id, 10) : Number(id);
  return prisma.product.update({
    where: { id: finalId },
    data: data as any
  });
}

export function getCategoryById(id: string | number) {
  const finalId = typeof id === "string" ? parseInt(id, 10) : Number(id);
  if (isNaN(finalId)) return null;

  return prisma.category.findUnique({
    where: { id: finalId }
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({ where: { name: slug } }); // Category has no slug, using name lookup
}

export function getCategoryByName(name: string) {
  return prisma.category.findFirst({ where: { name } });
}

export function getProductBySku(sku: string) {
  // Search by SKU in ProductVariant or ProductSku tables
  return prisma.productVariant.findFirst({ 
    where: { sku },
    include: {
      Product: {
        include: {
          Category: true,
          ProductSku: true,
          ProductVariant: true
        }
      }
    }
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({ 
    where: { slug },
    include: {
      Category: true,
      Brand: true,
      ProductSku: {
        include: {
          SkuAttribute: {
            include: {
              AttributeValue: {
                include: {
                  Attribute: true
                }
              }
            }
          }
        }
      },
      ProductVariant: true
    }
  });
}
