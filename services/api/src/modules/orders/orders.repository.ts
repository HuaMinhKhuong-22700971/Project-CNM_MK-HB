import { prisma } from "../../config/prisma";

export function getOrdersByUser(userId: string) {
  const numericId = parseInt(userId, 10);
  return prisma.order.findMany({
    where: { user_id: numericId },
    include: {
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
