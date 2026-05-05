import { Request, Response } from "express";

import { ROLES } from "../../constants/roles";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";
import {
  createCategory,
  createProduct,
  getCategoryById,
  getCategoryByName,
  getCategoryBySlug,
  getProductById,
  getProductBySku,
  getProductBySlug,
  listCategories,
  listProducts,
  updateProduct
} from "./catalog.repository";
import {
  createCategorySchema,
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema
} from "./catalog.validator";

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await listCategories();

  res.status(200).json({
    success: true,
    data: categories
  });
});

const mapProduct = (p: any) => {
  const sku = p.ProductSku?.[0];
  const variant = p.ProductVariant?.[0];
  let imageUrl = sku?.image_url || variant?.image_url || "";
  
  // Fallback for missing or broken images (short base64 strings in DB)
  if (!imageUrl || (imageUrl.startsWith('data:image') && imageUrl.length < 1000)) {
    imageUrl = "https://placehold.co/600x400/f3f4f6/374151?text=No+Image";
  }

  // Extract attributes (technical specifications) from SkuAttributes
  const attributes: any[] = [];
  const seenKeys = new Set();

  if (Array.isArray(p.ProductSku)) {
    p.ProductSku.forEach((s: any) => {
      if (Array.isArray(s.SkuAttribute)) {
        s.SkuAttribute.forEach((sa: any) => {
          const key = sa.AttributeValue?.Attribute?.name;
          const value = sa.AttributeValue?.value;
          if (key && value && !seenKeys.has(key)) {
            attributes.push({ key, value });
            seenKeys.add(key);
          }
        });
      }
    });
  }

  return {
    ...p,
    image_url: imageUrl,
    imageUrl: imageUrl,
    isActive: p.is_active,
    stock: sku?.stock || variant?.stock_quantity || 0,
    brand_name: p.Brand?.name,
    brand: p.Brand,
    attributes,
    skus: (p.ProductSku || []).map((s: any) => ({
      ...s,
      imageUrl: s.image_url || imageUrl
    })),
    // Add defaultVariant for consistency with some frontend parts
    defaultVariant: variant ? { ...variant, imageUrl: typeof variant.image_url === 'string' && variant.image_url.length > 1000 ? variant.image_url : imageUrl } : undefined
  };
};

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = listProductsQuerySchema.parse(req.query);

  const result = await listProducts({
    search: query.search,
    categorySlug: query.category,
    categoryId: query.category_id,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    isActive: query.isActive,
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder
  });

  res.status(200).json({
    success: true,
    data: result.items.map(mapProduct),
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit)
    }
  });
});

export const getProductDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  let product = await getProductById(id);

  if (!product) {
    product = await getProductBySlug(id);
  }

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    data: mapProduct(product)
  });
});

export const postCategory = asyncHandler(async (req: Request, res: Response) => {
  const payload = createCategorySchema.parse(req.body);

  const [existingSlug, existingName] = await Promise.all([
    getCategoryBySlug(payload.slug),
    getCategoryByName(payload.name)
  ]);

  if (existingSlug) {
    throw new AppError("Category slug already exists", 409);
  }

  if (existingName) {
    throw new AppError("Category name already exists", 409);
  }

  const category = await createCategory(payload);

  res.status(201).json({
    success: true,
    data: category
  });
});

export const postProduct = asyncHandler(async (req: Request, res: Response) => {
  const payload = createProductSchema.parse(req.body);

  const [category, existingSku, existingSlug] = await Promise.all([
    getCategoryById(payload.categoryId),
    getProductBySku(payload.sku),
    getProductBySlug(payload.slug)
  ]);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (existingSku) {
    throw new AppError("SKU already exists", 409);
  }

  if (existingSlug) {
    throw new AppError("Product slug already exists", 409);
  }

  const product = await createProduct(payload);

  res.status(201).json({
    success: true,
    data: product
  });
});

export const patchProduct = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateProductSchema.parse(req.body);

  const current = await getProductById(req.params.id);
  if (!current) {
    throw new AppError("Product not found", 404);
  }

  if (payload.categoryId) {
    const category = await getCategoryById(payload.categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  if (payload.slug && payload.slug !== current.slug) {
    const existingSlug = await getProductBySlug(payload.slug);
    if (existingSlug) {
      throw new AppError("Product slug already exists", 409);
    }
  }

  const updated = await updateProduct(req.params.id, payload);

  res.status(200).json({
    success: true,
    data: updated
  });
});

export const catalogAdminRoles = [ROLES.ADMIN];
