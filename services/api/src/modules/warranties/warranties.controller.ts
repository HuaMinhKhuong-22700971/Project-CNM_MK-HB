import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";

export const getEligibleWarrantyItems = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  // Tìm các OrderItem thuộc đơn hàng đã COMPLETED của user này và chưa có trong WarrantyItem
  const eligibleItems = await prisma.orderItem.findMany({
    where: {
      order: { userId, status: "COMPLETED" },
      warranties: { none: {} }
    },
    include: { product: true }
  });

  const formatted = eligibleItems.map((item: any) => ({
    id: item.id,
    orderId: item.orderId,
    productName: item.nameSnapshot,
    sku: item.skuSnapshot
  }));

  res.status(200).json({ success: true, data: formatted });
});

export const getMyWarranties = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const warranties = await prisma.warrantyItem.findMany({
    where: { orderItem: { order: { userId } } },
    include: { orderItem: { include: { order: true } } },
    orderBy: { createdAt: "desc" }
  });

  const formatted = warranties.map((w: any) => ({
    id: w.id,
    warrantyCode: w.serialNumber, // Frontend expects warrantyCode
    status: w.isActive ? "ACTIVE" : "EXPIRED",
    activatedAt: w.startDate,
    expiresAt: w.endDate,
    item: {
      productName: w.orderItem.nameSnapshot,
      sku: w.orderItem.skuSnapshot,
      unitPrice: w.orderItem.unitPrice,
      quantity: 1
    }
  }));

  res.status(200).json({ success: true, data: formatted });
});

export const activateWarranty = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const { orderItemId, note } = req.body;
  if (!orderItemId) throw new AppError("Thiếu orderItemId", 400);

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: String(orderItemId) },
    include: { order: true }
  });

  if (!orderItem || orderItem.order.userId !== userId || orderItem.order.status !== "COMPLETED") {
    throw new AppError("Sản phẩm không hợp lệ để kích hoạt bảo hành", 400);
  }

  const existing = await prisma.warrantyItem.findFirst({ where: { orderItemId: orderItem.id } });
  if (existing) {
    throw new AppError("Sản phẩm này đã được kích hoạt bảo hành", 400);
  }

  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1); // Default 1 year 

  const warranty = await prisma.warrantyItem.create({
    data: {
      orderItemId: orderItem.id,
      serialNumber: `${orderItem.skuSnapshot}-BH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      endDate
    },
    include: { orderItem: true }
  });

  res.status(201).json({
    success: true,
    data: {
      id: warranty.id,
      warrantyCode: warranty.serialNumber,
      status: "ACTIVE",
      activatedAt: warranty.startDate,
      expiresAt: warranty.endDate,
      note: note || "",
      item: {
        productName: warranty.orderItem.nameSnapshot,
        sku: warranty.orderItem.skuSnapshot,
        unitPrice: warranty.orderItem.unitPrice,
        quantity: 1
      }
    }
  });
});
