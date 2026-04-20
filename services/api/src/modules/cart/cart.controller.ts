import { Request, Response } from "express";

import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";
import {
  addCartItem,
  clearCart,
  deleteCartItem,
  findCartItemByCartAndProduct,
  findCartItemById,
  getCartDetailByUserId,
  getOrCreateCartByUserId,
  updateCartItem
} from "./cart.repository";
import { addCartItemSchema, updateCartItemSchema } from "./cart.validator";

function calculateCartTotals(items: Array<{ quantity: number; product: { price: unknown } }>) {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.product.price);
    return sum + price * item.quantity;
  }, 0);

  return {
    subtotal,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

export const getMyCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const cart = await getCartDetailByUserId(req.user.userId);
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const totals = calculateCartTotals(cart.items);

  res.status(200).json({
    success: true,
    data: {
      ...cart,
      ...totals
    }
  });
});

export const postCartItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = addCartItemSchema.parse(req.body);

  const product = await prisma.product.findUnique({
    where: { id: payload.productId }
  });

  if (!product || !product.isActive) {
    throw new AppError("Product not found or inactive", 404);
  }

  if (product.stock < payload.quantity) {
    throw new AppError("Insufficient stock", 400);
  }

  const cart = await getOrCreateCartByUserId(req.user.userId);
  const existingItem = await findCartItemByCartAndProduct(cart.id, payload.productId);

  if (existingItem) {
    const nextQty = existingItem.quantity + payload.quantity;
    if (nextQty > product.stock) {
      throw new AppError("Requested quantity exceeds stock", 400);
    }

    await updateCartItem(existingItem.id, nextQty);
  } else {
    await addCartItem({
      cartId: cart.id,
      productId: payload.productId,
      quantity: payload.quantity
    });
  }

  const updatedCart = await getCartDetailByUserId(req.user.userId);
  const totals = calculateCartTotals(updatedCart?.items || []);

  res.status(200).json({
    success: true,
    data: {
      ...updatedCart,
      ...totals
    }
  });
});

export const patchCartItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = updateCartItemSchema.parse(req.body);
  const item = await findCartItemById(req.params.itemId);

  if (!item || item.cart.userId !== req.user.userId) {
    throw new AppError("Cart item not found", 404);
  }

  const product = await prisma.product.findUnique({ where: { id: item.productId } });
  if (!product || product.stock < payload.quantity) {
    throw new AppError("Insufficient stock", 400);
  }

  await updateCartItem(item.id, payload.quantity);

  const updatedCart = await getCartDetailByUserId(req.user.userId);
  const totals = calculateCartTotals(updatedCart?.items || []);

  res.status(200).json({
    success: true,
    data: {
      ...updatedCart,
      ...totals
    }
  });
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const item = await findCartItemById(req.params.itemId);

  if (!item || item.cart.userId !== req.user.userId) {
    throw new AppError("Cart item not found", 404);
  }

  await deleteCartItem(item.id);

  const updatedCart = await getCartDetailByUserId(req.user.userId);
  const totals = calculateCartTotals(updatedCart?.items || []);

  res.status(200).json({
    success: true,
    data: {
      ...updatedCart,
      ...totals
    }
  });
});

export const clearMyCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const cart = await getOrCreateCartByUserId(req.user.userId);
  await clearCart(cart.id);

  res.status(200).json({
    success: true,
    data: {
      id: cart.id,
      items: [],
      subtotal: 0,
      itemCount: 0
    }
  });
});
