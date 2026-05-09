import { prisma } from "../../config/prisma";

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

  return {
    ...rest,
    shipment: normalizeShipment(latestShipment),
    customer
  };
}

export function getOrdersByUser(userId: string) {
  const numericId = parseInt(userId, 10);
  return prisma.order.findMany({
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
  });
}

export function getOrderById(orderId: string | number) {
  return prisma.order.findUnique({
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
  });
}

export function listOrders() {
  return prisma.order.findMany({
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
  });
}

export function updateOrderStatus(orderId: string | number, status: string) {
  return prisma.order.update({
    where: { id: typeof orderId === "string" ? parseInt(orderId, 10) : orderId },
    data: { status }
  });
}

export function markOrderPaid(orderId: string | number) {
  return prisma.order.update({
    where: { id: typeof orderId === "string" ? parseInt(orderId, 10) : orderId },
    data: {
      status: "PAID",
      payment_status: "PAID"
    }
  });
}
