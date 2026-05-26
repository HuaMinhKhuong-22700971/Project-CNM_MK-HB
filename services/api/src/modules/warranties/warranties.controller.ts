import { Request, Response } from "express";

import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";

type WarrantyMediaFile = {
  filename: string;
};

const WARRANTY_STEPS = ["RECEIVED", "INSPECTING", "REPAIRING", "COMPLETED"];

function addOneYear(date = new Date()) {
  const expiresAt = new Date(date);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  return expiresAt;
}

function generateWarrantyCode(orderItemId: number) {
  return `BH-${orderItemId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function buildTimeline(status = "RECEIVED") {
  const normalized = String(status || "RECEIVED").toUpperCase();
  const activeIndex = Math.max(WARRANTY_STEPS.indexOf(normalized), 0);
  const labels: Record<string, string> = {
    RECEIVED: "Đã tiếp nhận",
    INSPECTING: "Đang kiểm tra",
    REPAIRING: "Đang sửa",
    COMPLETED: "Hoàn tất"
  };

  return WARRANTY_STEPS.map((step, index) => ({
    key: step,
    label: labels[step],
    done: index <= activeIndex
  }));
}

async function ensureWarrantyRequestTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS warranty_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      warranty_id INT NULL,
      user_id INT NULL,
      lookup_value VARCHAR(255) NULL,
      customer_name VARCHAR(255) NULL,
      customer_phone VARCHAR(50) NULL,
      issue_description TEXT NOT NULL,
      media_url VARCHAR(255) NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'RECEIVED',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_warranty_requests_warranty (warranty_id),
      INDEX idx_warranty_requests_user (user_id),
      INDEX idx_warranty_requests_lookup (lookup_value)
    )
  `);
}

async function ensureDeliveredOrderWarrantiesForUser(userId: number) {
  const deliveredItems = await prisma.orderItem.findMany({
    where: {
      Order: { user_id: userId, status: "DELIVERED" },
      WarrantyItem: null
    }
  });

  if (deliveredItems.length === 0) return;

  const now = new Date();
  await Promise.all(
    deliveredItems.map((item: any) =>
      prisma.warrantyItem
        .create({
          data: {
            user_id: userId,
            order_item_id: item.id,
            order_id: item.order_id,
            sku_id: item.product_variant_id,
            warranty_code: generateWarrantyCode(item.id),
            status: "ACTIVE",
            activated_at: now,
            expires_at: addOneYear(now),
            note: "Auto-created from delivered order"
          }
        })
        .catch(() => null)
    )
  );
}

function formatWarranty(warranty: any) {
  return {
    id: warranty.id,
    orderId: warranty.order_id,
    orderItemId: warranty.order_item_id,
    warrantyCode: warranty.warranty_code,
    status: warranty.status,
    activatedAt: warranty.activated_at,
    expiresAt: warranty.expires_at,
    note: warranty.note,
    qrUrl: `/warranties?lookup=${encodeURIComponent(warranty.warranty_code)}`,
    timeline: buildTimeline(warranty.status === "COMPLETED" ? "COMPLETED" : "RECEIVED"),
    item: {
      productName: warranty.OrderItem?.name_snapshot,
      sku: warranty.OrderItem?.sku_snapshot,
      unitPrice: warranty.OrderItem?.unit_price,
      quantity: warranty.OrderItem?.quantity ?? 1
    }
  };
}

function buildLookupWhere(value: string) {
  const clauses: any[] = [
    { warranty_code: value },
    { warranty_code: { contains: value } },
    { OrderItem: { sku_snapshot: { contains: value } } },
    { User: { phone: { contains: value } } }
  ];

  if (/^\d+$/.test(value)) {
    clauses.push({ order_id: Number(value) });
  }

  return { OR: clauses };
}

export const getEligibleWarrantyItems = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const numericUserId = parseInt(userId, 10);
  await ensureDeliveredOrderWarrantiesForUser(numericUserId);

  const eligibleItems = await prisma.orderItem.findMany({
    where: {
      Order: { user_id: numericUserId, status: "DELIVERED" },
      WarrantyItem: null
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
  await ensureDeliveredOrderWarrantiesForUser(numericUserId);

  const warranties = await prisma.warrantyItem.findMany({
    where: { user_id: numericUserId },
    include: { OrderItem: true },
    orderBy: { created_at: "desc" }
  });

  res.status(200).json({ success: true, data: warranties.map(formatWarranty) });
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

  if (!orderItem || orderItem.Order.user_id !== numericUserId || orderItem.Order.status !== "DELIVERED") {
    throw new AppError("Sản phẩm không hợp lệ để kích hoạt bảo hành", 400);
  }

  const existing = await prisma.warrantyItem.findFirst({ where: { order_item_id: id } });
  if (existing) {
    throw new AppError("Sản phẩm này đã được kích hoạt bảo hành", 400);
  }

  const now = new Date();
  const warranty = await prisma.warrantyItem.create({
    data: {
      user_id: numericUserId,
      order_item_id: id,
      order_id: orderItem.order_id,
      sku_id: orderItem.product_variant_id,
      warranty_code: generateWarrantyCode(id),
      note: note || null,
      status: "ACTIVE",
      activated_at: now,
      expires_at: addOneYear(now)
    },
    include: { OrderItem: true }
  });

  res.status(201).json({ success: true, data: formatWarranty(warranty) });
});

export const lookupWarranty = asyncHandler(async (req: Request, res: Response) => {
  const lookupValue = String(req.params.code || req.query.q || req.query.code || req.query.orderId || req.query.phone || "").trim();
  if (!lookupValue) throw new AppError("Thiếu thông tin tra cứu bảo hành", 400);

  const warranty = await prisma.warrantyItem.findFirst({
    where: buildLookupWhere(lookupValue),
    include: { OrderItem: true }
  });

  if (!warranty) {
    throw new AppError("Không tìm thấy thông tin bảo hành cho thông tin này", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      ...formatWarranty(warranty),
      productName: warranty.OrderItem?.name_snapshot,
      sku: warranty.OrderItem?.sku_snapshot
    }
  });
});

export const submitWarrantyRequest = asyncHandler(async (req: Request, res: Response) => {
  await ensureWarrantyRequestTable();

  const file = (req as Request & { file?: WarrantyMediaFile }).file;
  const lookupValue = String(req.body?.lookupValue || req.body?.warrantyCode || req.body?.serial || req.body?.orderId || "").trim();
  const issueDescription = String(req.body?.issueDescription || req.body?.description || "").trim();

  if (!issueDescription) {
    throw new AppError("Vui lòng mô tả lỗi cần bảo hành", 400);
  }

  let warrantyId: number | null = req.body?.warrantyId ? Number(req.body.warrantyId) : null;
  if (!warrantyId && lookupValue) {
    const warranty = await prisma.warrantyItem.findFirst({ where: buildLookupWhere(lookupValue) });
    warrantyId = warranty?.id || null;
  }

  const mediaUrl = file ? `/uploads/warranty-requests/${file.filename}` : null;
  const userId = req.user?.userId ? Number(req.user.userId) : null;

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO warranty_requests
        (warranty_id, user_id, lookup_value, customer_name, customer_phone, issue_description, media_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'RECEIVED')
    `,
    warrantyId,
    userId,
    lookupValue || null,
    String(req.body?.customerName || "").trim() || null,
    String(req.body?.customerPhone || "").trim() || null,
    issueDescription,
    mediaUrl
  );

  res.status(201).json({
    success: true,
    data: {
      warrantyId,
      lookupValue,
      mediaUrl,
      status: "RECEIVED",
      timeline: buildTimeline("RECEIVED")
    }
  });
});

export const getMyWarrantyRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);
  await ensureWarrantyRequestTable();

  const rows = await prisma.$queryRawUnsafe<any[]>(
    `
      SELECT id, warranty_id AS warrantyId, lookup_value AS lookupValue, issue_description AS issueDescription,
             media_url AS mediaUrl, status, created_at AS createdAt, updated_at AS updatedAt
      FROM warranty_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
    Number(userId)
  );

  res.status(200).json({
    success: true,
    data: rows.map((row) => ({ ...row, timeline: buildTimeline(row.status) }))
  });
});
