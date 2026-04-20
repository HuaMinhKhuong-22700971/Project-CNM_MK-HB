import { prisma } from "../../config/prisma";

export function getOrdersByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true
    }
  });
}

export function listOrders() {
  return prisma.order.findMany({
    include: {
      items: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export function updateOrderStatus(orderId: string, status: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
}

export function markOrderPaid(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paymentStatus: "PAID"
    }
  });
}
