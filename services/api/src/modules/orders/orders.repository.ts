import { prisma } from "../../config/prisma";

let paymentProofColumnReady: boolean | null = null;

async function repairLegacyPaidOrders(orderId?: number | string | null) {
  const params: Array<number> = [];
  let whereClause = "payment_status = 'PAID' AND status = 'PAID'";

  if (orderId !== undefined && orderId !== null) {
    whereClause += " AND id = ?";
    params.push(Number(orderId));
  }

  await prisma.$executeRawUnsafe(
    `
      UPDATE orders
      SET status = 'PROCESSING',
          updated_at = NOW()
      WHERE ${whereClause}
    `,
    ...params
  );
}

async function hasPaymentProofColumn() {
  if (paymentProofColumnReady !== null) {
    return paymentProofColumnReady;
  }

  const rows = await prisma.$queryRawUnsafe<Array<{ COLUMN_NAME: string }>>(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'orders'
        AND COLUMN_NAME = 'payment_proof'
      LIMIT 1
    `
  );

  paymentProofColumnReady = rows.length > 0;
  return paymentProofColumnReady;
}

export async function ensurePaymentProofColumn() {
  if (await hasPaymentProofColumn()) {
    return true;
  }

  await prisma.$executeRawUnsafe("ALTER TABLE orders ADD COLUMN payment_proof VARCHAR(255) NULL");
  paymentProofColumnReady = true;
  return true;
}

async function getPaymentProof(orderId: number | string | null | undefined) {
  if (!orderId || !(await hasPaymentProofColumn())) {
    return null;
  }

  const rows = await prisma.$queryRawUnsafe<Array<{ payment_proof: string | null }>>(
    "SELECT payment_proof FROM orders WHERE id = ? LIMIT 1",
    Number(orderId)
  );

  return rows[0]?.payment_proof || null;
}

function normalizeShipment(shipment: any) {
  if (!shipment) {
    return null;
  }

  return {
    id: shipment.id,
    orderId: shipment.order_id,
    status: shipment.status,
    trackingCode: shipment.tracking_code
  };
}

function normalizeCustomer(user: any) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone
  };
}

async function getCustomerByUserId(userId: number | null | undefined) {
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  return normalizeCustomer(user);
}

export async function normalizeOrderRecord<T extends Record<string, any> | null>(order: T) {
  if (!order) {
    return order;
  }

  const { Shipment, ...rest } = order;
  const latestShipment = Array.isArray(Shipment) && Shipment.length > 0
    ? Shipment[0]
    : null;
  const customer = await getCustomerByUserId(rest.user_id);
  const paymentProof = await getPaymentProof(rest.id);

  return {
    ...rest,
    payment_proof: paymentProof,
    paymentProof,
    shipment: normalizeShipment(latestShipment),
    customer
  };
}

export function getOrdersByUser(userId: string) {
  const numericId = parseInt(userId, 10);
  return repairLegacyPaidOrders().then(() =>
    prisma.order.findMany({
    where: { user_id: numericId },
    include: {
      Shipment: {
        orderBy: { id: "desc" },
        take: 1
      },
      OrderItem: {
        include: {
          ProductSku: true
        }
      }
    },
    orderBy: { created_at: "desc" }
    })
  );
}

export function getOrderById(orderId: string | number) {
  return repairLegacyPaidOrders(orderId).then(() =>
    prisma.order.findUnique({
    where: { id: typeof orderId === "string" ? parseInt(orderId, 10) : orderId },
    include: {
      Shipment: {
        orderBy: { id: "desc" },
        take: 1
      },
      OrderItem: {
        include: {
          ProductSku: true
        }
      }
    }
    })
  );
}

export function listOrders() {
  return repairLegacyPaidOrders().then(() =>
    prisma.order.findMany({
    include: {
      Shipment: {
        orderBy: { id: "desc" },
        take: 1
      },
      OrderItem: {
        include: {
          ProductSku: true
        }
      }
    },
    orderBy: { created_at: "desc" }
    })
  );
}

export function updateOrderStatus(orderId: string | number, status: string) {
  return prisma.order.update({
    where: { id: typeof orderId === "string" ? parseInt(orderId, 10) : orderId },
    data: { status }
  });
}

export function completeDeliveredOrder(orderId: string | number, userId: string | number) {
  return prisma.order.updateMany({
    where: {
      id: typeof orderId === "string" ? parseInt(orderId, 10) : orderId,
      user_id: typeof userId === "string" ? parseInt(userId, 10) : userId,
      status: "DELIVERED"
    },
    data: {
      status: "COMPLETED"
    }
  });
}

export function markOrderPaid(orderId: string | number) {
  return prisma.order.update({
    where: { id: typeof orderId === "string" ? parseInt(orderId, 10) : orderId },
    data: {
      status: "PROCESSING",
      payment_status: "PAID"
    }
  });
}

export function markOrderPaymentCancelled(orderId: string | number) {
  return prisma.order.update({
    where: { id: typeof orderId === "string" ? parseInt(orderId, 10) : orderId },
    data: {
      payment_status: "PAYMENT_CANCELLED"
    }
  });
}

export async function saveOrderPaymentProof(orderId: string | number, paymentProofUrl: string) {
  await ensurePaymentProofColumn();

  return prisma.$executeRawUnsafe(
    `
      UPDATE orders
      SET payment_proof = ?,
          payment_status = 'AWAITING_ADMIN_CONFIRMATION',
          updated_at = NOW()
      WHERE id = ?
    `,
    paymentProofUrl,
    typeof orderId === "string" ? parseInt(orderId, 10) : orderId
  );
}
