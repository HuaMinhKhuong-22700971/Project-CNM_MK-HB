import { Request, Response } from "express";

import { prisma } from "../../config/prisma";
import { ROLES } from "../../constants/roles";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";
import {
  completeDeliveredOrder,
  ensurePaymentProofColumn,
  getOrderById,
  getOrdersByUser,
  listOrders,
  markOrderPaymentCancelled,
  markOrderPaid,
  normalizeOrderRecord,
  saveOrderPaymentProof,
  updateOrderStatus
} from "./orders.repository";
import { checkoutSchema, updateOrderStatusSchema } from "./orders.validator";
import { generateVnpayUrl, verifyVnpayReturn } from "../../utils/vnpay";
import { env } from "../../config/env";
import jwt from "jsonwebtoken";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createWarrantyRecordsForDeliveredOrder } = require("../warranties/warranty-sync.service");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { publishOrderEvent, subscribeOrderEvents } = require("../../services/order-events");

type UploadedPaymentProofFile = {
  filename: string;
};

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const currentUser = req.user;
  const payload = checkoutSchema.parse(req.body);

  const result = await prisma.$transaction(async (tx: any) => {
    let cart = await tx.cart.findFirst({ where: { user_id: Number(currentUser.userId) } });

    if (!cart) {
      cart = await tx.cart.create({ data: { user_id: Number(currentUser.userId) } });
    }

    const cartWithItems = await tx.cart.findUnique({
      where: { id: cart.id },
      include: {
        CartItem: {
          include: {
            ProductSku: {
              include: {
                Product: true
              }
            }
          }
        }
      }
    });

    if (!cartWithItems || cartWithItems.CartItem.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    if (payload.addressId) {
      const address = await tx.address.findFirst({
        where: {
          id: payload.addressId,
          user_id: Number(currentUser.userId)
        }
      });

      if (!address) {
        throw new AppError("Shipping address not found", 404);
      }
    }

    let total = 0;
    for (const item of cartWithItems.CartItem) {
      if (!item.ProductSku || !item.ProductSku.is_active) {
        throw new AppError(`Product SKU ${item.ProductSku?.sku || 'Unknown'} is completely inactive`, 400);
      }

      if (Number(item.ProductSku.stock) < item.quantity) {
        throw new AppError(`Vượt quá tồn kho cho sản phẩm ${item.ProductSku.Product?.name || 'Unknown'}`, 400);
      }

      total += Number(item.ProductSku.price) * item.quantity;
    }

    const shippingFee = Number(payload.shippingFee || 0);
    const finalAmount = total + shippingFee;
    
    const order = await tx.order.create({
      data: {
        user_id: Number(currentUser.userId),
        address_id: payload.addressId,
        total_price: total, // Just backward compat
        total_amount: total,
        shipping_fee: shippingFee,
        final_amount: finalAmount,
        payment_method: payload.paymentMethod,
        shipping_address: payload.shippingAddress,
        payment_status: payload.paymentMethod === "COD" ? "UNPAID" : "PENDING_GATEWAY",
        status: "PENDING",
        note: payload.note,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    for (const item of cartWithItems.CartItem) {
      const unitPrice = Number(item.ProductSku.price);
      const lineTotal = unitPrice * item.quantity;

      await tx.orderItem.create({
        data: {
          order_id: order.id,
          product_variant_id: item.product_variant_id,
          product_id: item.ProductSku.product_id,
          sku_snapshot: item.ProductSku.sku,
          name_snapshot: item.ProductSku.Product?.name || item.ProductSku.sku,
          unit_price: unitPrice,
          quantity: item.quantity,
          line_total: lineTotal,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      await tx.productSku.update({
        where: { id: item.product_variant_id },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    await tx.cartItem.deleteMany({
      where: { cart_id: cart.id }
    });

    const createdOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: { OrderItem: true }
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
    data: await Promise.all(orders.map((order) => normalizeOrderRecord(order)))
  });
});

export const streamOrderEvents = asyncHandler(async (req: Request, res: Response) => {
  const token = String(req.query.token || "");
  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as { userId?: string; sub?: string };
    const userId = payload.userId || payload.sub;
    if (!userId) {
      throw new Error("Token does not include user id");
    }
    subscribeOrderEvents(userId, res);
  } catch (_error) {
    throw new AppError("Invalid or expired token", 401);
  }
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
    order.user_id === Number(req.user.userId) ||
    req.user.role === ROLES.ADMIN ||
    req.user.role === ROLES.SALES;

  if (!canAccess) {
    throw new AppError("Forbidden", 403);
  }

  res.status(200).json({
    success: true,
    data: await normalizeOrderRecord(order)
  });
});

export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await listOrders();

  res.status(200).json({
    success: true,
    data: await Promise.all(orders.map((order) => normalizeOrderRecord(order)))
  });
});

export const patchOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateOrderStatusSchema.parse(req.body);

  const current = await getOrderById(req.params.id);
  if (!current) {
    throw new AppError("Order not found", 404);
  }

  const result = await prisma.$transaction(async (tx: any) => {
    // Note: trackingCode is not in the schema, using note field as workaround
    if ((payload.status === "PROCESSING" || payload.status === "SHIPPED")) {
      // Shipment tracking can be managed via Shipment model instead
    }

    return await tx.order.update({
      where: { id: Number(req.params.id) },
      data: { status: payload.status }
    });
  });

  // Return full order to show new trackingCode or details
  const finalOrder = await getOrderById(req.params.id);
  if (finalOrder?.user_id) {
    publishOrderEvent(finalOrder.user_id, {
      orderId: finalOrder.id,
      status: finalOrder.status,
      paymentStatus: finalOrder.payment_status
    });
  }

  res.status(200).json({
    success: true,
    data: await normalizeOrderRecord(finalOrder)
  });
});

export const confirmOrderReceived = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const order = await getOrderById(req.params.id);
  if (!order || order.user_id !== Number(req.user.userId)) {
    throw new AppError("Order not found", 404);
  }

  if (order.status !== "DELIVERED") {
    throw new AppError("Only delivered orders can be confirmed as received", 400);
  }

  const result = await completeDeliveredOrder(req.params.id, req.user.userId);
  if (result.count === 0) {
    throw new AppError("Order status was changed. Please reload and try again.", 409);
  }

  const updatedOrder = await getOrderById(req.params.id);
  await createWarrantyRecordsForDeliveredOrder(req.params.id);
  publishOrderEvent(req.user.userId, {
    orderId: updatedOrder?.id || req.params.id,
    status: updatedOrder?.status || "COMPLETED",
    paymentStatus: updatedOrder?.payment_status
  });

  res.status(200).json({
    success: true,
    message: "Order received confirmed",
    data: await normalizeOrderRecord(updatedOrder)
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
    data: await normalizeOrderRecord(paid),
    message: "Payment confirmed (mock)"
  });
});

export const createVnpayUrl = asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderById(req.params.id);
  if (!order || order.user_id !== Number(req.user?.userId)) {
    throw new AppError("Order not found", 404);
  }

  if (order.payment_status === "PAID") {
    throw new AppError("Order already paid", 400);
  }

  const tmnCode = env.vnpayTmnCode || process.env.VNPAY_TMN_CODE;
  const secretKey = env.vnpayHashSecret || process.env.VNPAY_HASH_SECRET;
  const frontendUrl = env.frontendUrl || process.env.FRONTEND_URL || "http://localhost:5173";
  const shouldUseMockPayment = env.paymentMockMode || ((!tmnCode || !secretKey) && env.nodeEnv !== "production");

  if (shouldUseMockPayment) {
    const payAmount = Number(order.final_amount || order.total_amount || 0);
    const mockUrl = `${frontendUrl}/payment/mock?orderId=${order.id}&amount=${payAmount}`;
    res.status(200).json({
      success: true,
      data: { paymentUrl: mockUrl, isMock: true }
    });
    return;
  }

  if (!tmnCode || !secretKey) {
    throw new AppError("VNPay is not configured", 503);
  }

  const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const url = generateVnpayUrl(
    ipAddr as string,
    String(order.id),
    Number(order.final_amount || order.total_amount || 0),
    `Thanh toan don hang ${order.id}`
  );

  res.status(200).json({
    success: true,
    data: { paymentUrl: url }
  });
});

export const confirmMockPayment = asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderById(req.params.id);
  if (!order || order.user_id !== Number(req.user?.userId)) {
    throw new AppError("Order not found", 404);
  }

  await markOrderPaid(req.params.id);

  res.status(200).json({
    success: true,
    message: "Payment confirmed (mock)",
    data: { orderId: req.params.id }
  });
});

export const cancelMockPayment = asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderById(req.params.id);
  if (!order || order.user_id !== Number(req.user?.userId)) {
    throw new AppError("Order not found", 404);
  }

  if (order.payment_status === "PAID") {
    throw new AppError("Order already paid", 400);
  }

  await markOrderPaymentCancelled(req.params.id);

  res.status(200).json({
    success: true,
    message: "Payment cancelled (mock)",
    data: { orderId: req.params.id, paymentStatus: "PAYMENT_CANCELLED" }
  });
});

export const uploadPaymentProof = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as Request & { file?: UploadedPaymentProofFile }).file;
  const order = await getOrderById(req.params.id);

  if (!order || order.user_id !== Number(req.user?.userId)) {
    throw new AppError("Order not found", 404);
  }

  if (order.payment_method !== "BANK_TRANSFER") {
    throw new AppError("Payment proof upload is only available for QR Banking orders", 400);
  }

  if (order.payment_status === "PAID") {
    throw new AppError("Order already paid", 400);
  }

  if (!file) {
    throw new AppError("Payment proof image is required", 400);
  }

  const proofUrl = `/uploads/payment-proofs/${file.filename}`;
  await saveOrderPaymentProof(req.params.id, proofUrl);

  const updatedOrder = await getOrderById(req.params.id);
  if (updatedOrder?.user_id) {
    publishOrderEvent(updatedOrder.user_id, {
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.payment_status
    });
  }

  res.status(200).json({
    success: true,
    message: "Payment proof uploaded successfully",
    data: {
      ...(await normalizeOrderRecord(updatedOrder)),
      paymentProof: proofUrl,
      paymentStatus: "AWAITING_ADMIN_CONFIRMATION"
    }
  });
});

export const approvePaymentProof = asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderById(req.params.id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.payment_method !== "BANK_TRANSFER") {
    throw new AppError("Payment approval is only available for QR Banking orders", 400);
  }

  await ensurePaymentProofColumn();

  const approved = Boolean(req.body?.approved);
  if (approved) {
    await prisma.$executeRawUnsafe(
      `
        UPDATE orders
        SET payment_status = 'PAID',
            status = 'PROCESSING',
            updated_at = NOW()
        WHERE id = ?
      `,
      Number(req.params.id)
    );
  } else {
    await prisma.$executeRawUnsafe(
      `
        UPDATE orders
        SET payment_status = 'REJECTED',
            status = 'PENDING',
            updated_at = NOW()
        WHERE id = ?
      `,
      Number(req.params.id)
    );
  }

  const updatedOrder = await getOrderById(req.params.id);
  if (updatedOrder?.user_id) {
    publishOrderEvent(updatedOrder.user_id, {
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.payment_status
    });
  }

  res.status(200).json({
    success: true,
    message: approved ? "Payment approved" : "Payment rejected",
    data: await normalizeOrderRecord(updatedOrder)
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

  if (!isSecure) {
    console.error("[VNPay IPN] Invalid checksum for params:", vnp_Params);
    res.status(200).json({ RspCode: "97", Message: "Invalid checksum" });
    return;
  }

  const orderId = vnp_Params["vnp_TxnRef"] as string;
  const responseCode = vnp_Params["vnp_ResponseCode"];
  const vnpTxnNo = vnp_Params["vnp_TransactionNo"] as string;

  console.log(`[VNPay IPN] Order: ${orderId}, Code: ${responseCode}, TxnNo: ${vnpTxnNo}`);

  if (responseCode === "00") {
    const order = await getOrderById(orderId);
    if (!order) {
      console.error(`[VNPay IPN] Order not found: ${orderId}`);
      res.status(200).json({ RspCode: "01", Message: "Order not found" });
      return;
    }

    if (order.payment_status === "PAID") {
      console.log(`[VNPay IPN] Order already paid: ${orderId}, idempotent`);
      res.status(200).json({ RspCode: "00", Message: "Confirm Success (Already Paid)" });
      return;
    }

    await markOrderPaid(orderId);
    const updatedOrder = await getOrderById(orderId);
    if (updatedOrder?.user_id) {
      publishOrderEvent(updatedOrder.user_id, {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.payment_status
      });
    }
    console.log(`[VNPay IPN] Order marked as paid: ${orderId}`);
  }

  res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
});

export const cancelMyOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const orderId = req.params.id;
  const userId = req.user.userId;

  const result = await prisma.$transaction(async (tx: any) => {
    const order = await tx.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { OrderItem: true }
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.user_id !== Number(userId)) {
      throw new AppError("Forbidden: You can only cancel your own orders", 403);
    }

    if (order.status !== "PENDING") {
      throw new AppError(`Cannot cancel order in ${order.status} status. Only PENDING orders can be canceled.`, 400);
    }

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELED" }
    });

    // Restore stock
    for (const item of order.OrderItem) {
      await tx.productSku.update({
        where: { id: item.product_variant_id },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    return updatedOrder;
  });

  res.status(200).json({
    success: true,
    data: result,
    message: "Order canceled successfully"
  });

  publishOrderEvent(userId, {
    orderId,
    status: "CANCELED",
    paymentStatus: result.payment_status
  });
});
