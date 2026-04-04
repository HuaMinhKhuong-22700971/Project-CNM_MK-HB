import { Request, Response } from "express";

import { prisma } from "../../config/prisma";
import { ROLES } from "../../constants/roles";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";
import {
  getOrderById,
  getOrdersByUser,
  listOrders,
  markOrderPaid,
  updateOrderStatus
} from "./orders.repository";
import { checkoutSchema, updateOrderStatusSchema } from "./orders.validator";
import { generateVnpayUrl, verifyVnpayReturn } from "../../utils/vnpay";

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const currentUser = req.user;
  const payload = checkoutSchema.parse(req.body);

  const result = await prisma.$transaction(async (tx: any) => {
    let cart = await tx.cart.findUnique({ where: { userId: currentUser.userId } });

    if (!cart) {
      cart = await tx.cart.create({ data: { userId: currentUser.userId } });
    }

    const cartWithItems = await tx.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cartWithItems || cartWithItems.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    let total = 0;
    for (const item of cartWithItems.items) {
      if (!item.product.isActive) {
        throw new AppError(`Product ${item.product.name} is inactive`, 400);
      }

      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
      }

      total += Number(item.product.price) * item.quantity;
    }

    const order = await tx.order.create({
      data: {
        userId: currentUser.userId,
        totalAmount: total,
        paymentMethod: payload.paymentMethod,
        shippingAddress: payload.shippingAddress,
        paymentStatus: payload.paymentMethod === "COD" ? "UNPAID" : "PENDING_GATEWAY",
        status: "PENDING"
      }
    });

    for (const item of cartWithItems.items) {
      const unitPrice = Number(item.product.price);
      const lineTotal = unitPrice * item.quantity;

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          skuSnapshot: item.product.sku,
          nameSnapshot: item.product.name,
          unitPrice,
          quantity: item.quantity,
          lineTotal
        }
      });

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    const createdOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: { items: true }
    });

    return createdOrder;
  });

  res.status(201).json({
    success: true,
    data: result
  });
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const orders = await getOrdersByUser(req.user.userId);

  res.status(200).json({
    success: true,
    data: orders
  });
});

export const getOrderDetail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const order = await getOrderById(req.params.id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const canAccess =
    order.userId === req.user.userId ||
    req.user.role === ROLES.ADMIN ||
    req.user.role === ROLES.SALES;

  if (!canAccess) {
    throw new AppError("Forbidden", 403);
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await listOrders();

  res.status(200).json({
    success: true,
    data: orders
  });
});

export const patchOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateOrderStatusSchema.parse(req.body);

  const current = await getOrderById(req.params.id);
  if (!current) {
    throw new AppError("Order not found", 404);
  }

  // Generate tracking code if moving to PROCESSING/SHIPPED and lacking one
  if ((payload.status === "PROCESSING" || payload.status === "SHIPPED") && !current.trackingCode) {
    const mockTrackingCode = "GHN-" + Math.random().toString(36).substring(2, 11).toUpperCase();
    await prisma.order.update({
      where: { id: current.id },
      data: { trackingCode: mockTrackingCode }
    });
  }

  // Generate warranties if moving to COMPLETED and previously not COMPLETED
  if (payload.status === "COMPLETED" && current.status !== "COMPLETED") {
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year warranty default

    for (const item of current.items) {
      for (let i = 0; i < item.quantity; i++) {
        // Unique serial for each quantity 
        const generateSerial = `${item.skuSnapshot}-SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        await prisma.warrantyItem.create({
          data: {
            orderItemId: item.id,
            serialNumber: generateSerial,
            endDate
          }
        });
      }
    }
  }

  const updated = await updateOrderStatus(req.params.id, payload.status);

  // Return full order to show new trackingCode or details
  const finalOrder = await getOrderById(req.params.id);

  res.status(200).json({
    success: true,
    data: finalOrder
  });
});

export const payOrderMock = asyncHandler(async (req: Request, res: Response) => {
  const current = await getOrderById(req.params.id);
  if (!current) {
    throw new AppError("Order not found", 404);
  }

  const paid = await markOrderPaid(req.params.id);

  res.status(200).json({
    success: true,
    data: paid,
    message: "Payment confirmed (mock)"
  });
});

export const createVnpayUrl = asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderById(req.params.id);
  if (!order || order.userId !== req.user?.userId) {
    throw new AppError("Order not found", 404);
  }

  if (order.paymentStatus === "PAID") {
    throw new AppError("Order already paid", 400);
  }

  const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const url = generateVnpayUrl(
    ipAddr as string,
    order.id,
    Number(order.totalAmount),
    `Thanh toan don hang ${order.id}`
  );

  res.status(200).json({
    success: true,
    data: { paymentUrl: url }
  });
});

export const vnpayReturn = asyncHandler(async (req: Request, res: Response) => {
  const vnp_Params = req.query;
  const isSecure = verifyVnpayReturn(vnp_Params);

  if (isSecure) {
    const responseCode = vnp_Params["vnp_ResponseCode"];
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/result?success=${responseCode === "00"}&orderId=${vnp_Params["vnp_TxnRef"]}`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/result?success=false&reason=invalid_signature`);
  }
});

export const vnpayIpn = asyncHandler(async (req: Request, res: Response) => {
  const vnp_Params = req.query;
  const isSecure = verifyVnpayReturn(vnp_Params);

  if (isSecure) {
    const orderId = vnp_Params["vnp_TxnRef"] as string;
    const responseCode = vnp_Params["vnp_ResponseCode"];

    if (responseCode === "00") {
      const order = await getOrderById(orderId);
      if (order && order.paymentStatus !== "PAID") {
        await markOrderPaid(orderId);
      }
    }
    
    res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } else {
    res.status(200).json({ RspCode: "97", Message: "Invalid checksum" });
  }
});
