import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";

export const getEligibleWarrantyItems = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const numericUserId = parseInt(userId, 10);

  const eligibleItems = await prisma.orderItem.findMany({
    where: {
      Order: { user_id: numericUserId, status: "COMPLETED" },
      WarrantyItem: null  // No warranty registered yet
    }
  });

  const formatted = eligibleItems.map((item: any) => ({
    id: item.id,
    orderId: item.order_id,
    productName: item.name_snapshot,
    sku: item.sku_snapshot
  }));

  res.status(200).json({ success: true, data: formatted });
});

export const getMyWarranties = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const numericUserId = parseInt(userId, 10);

  const warranties = await prisma.warrantyItem.findMany({
    where: { user_id: numericUserId },
    include: { OrderItem: true },
    orderBy: { created_at: "desc" }
  });

  const formatted = warranties.map((w: any) => ({
    id: w.id,
    warrantyCode: w.warranty_code,
    status: w.status,
    activatedAt: w.activated_at,
    expiresAt: w.expires_at,
    note: w.note,
    item: {
      productName: w.OrderItem?.name_snapshot,
      sku: w.OrderItem?.sku_snapshot,
      unitPrice: w.OrderItem?.unit_price,
      quantity: w.OrderItem?.quantity ?? 1
    }
  }));

  res.status(200).json({ success: true, data: formatted });
});

export const activateWarranty = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const numericUserId = parseInt(userId, 10);
  const { orderItemId, note } = req.body;
  if (!orderItemId) throw new AppError("Thiếu orderItemId", 400);

  const id = typeof orderItemId === "string" ? parseInt(orderItemId, 10) : orderItemId;
  const orderItem = await prisma.orderItem.findUnique({
    where: { id },
    include: { Order: true }
  });

  if (!orderItem || orderItem.Order.user_id !== numericUserId || orderItem.Order.status !== "COMPLETED") {
    throw new AppError("Sản phẩm không hợp lệ để kích hoạt bảo hành", 400);
  }

  const existing = await prisma.warrantyItem.findFirst({ where: { order_item_id: id } });
  if (existing) {
    throw new AppError("Sản phẩm này đã được kích hoạt bảo hành", 400);
  }

  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const warrantyCode = `BH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const warranty = await prisma.warrantyItem.create({
    data: {
      user_id: numericUserId,
      order_item_id: id,
      order_id: orderItem.order_id,
      warranty_code: warrantyCode,
      note: note || null,
      status: "ACTIVE",
      activated_at: now,
      expires_at: expiresAt
    },
    include: { OrderItem: true }
  });

  res.status(201).json({
    success: true,
    data: {
      id: warranty.id,
      warrantyCode: warranty.warranty_code,
      status: warranty.status,
      activatedAt: warranty.activated_at,
      expiresAt: warranty.expires_at,
      note: warranty.note,
      item: {
        productName: warranty.OrderItem?.name_snapshot,
        sku: warranty.OrderItem?.sku_snapshot,
        unitPrice: warranty.OrderItem?.unit_price,
        quantity: warranty.OrderItem?.quantity ?? 1
      }
    }
  });
});

export const lookupWarranty = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;
  if (!code) throw new AppError("Thiếu mã bảo hành", 400);

  const warranty = await prisma.warrantyItem.findFirst({
    where: {
      OR: [
        { warranty_code: code },
        { warranty_code: { contains: code } }
      ]
    },
    include: { OrderItem: true }
  });

  if (!warranty) {
    throw new AppError("Không tìm thấy thông tin bảo hành cho mã này", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      warrantyCode: warranty.warranty_code,
      status: warranty.status,
      activatedAt: warranty.activated_at,
      expiresAt: warranty.expires_at,
      productName: warranty.OrderItem?.name_snapshot,
      sku: warranty.OrderItem?.sku_snapshot
    }
  });
});
