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
  normalizeOrderRecord,
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

  res.status(200).json({
    success: true,
    data: await normalizeOrderRecord(finalOrder)
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

  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  // Use mock flow if VNPAY credentials are not configured or mock mode is enabled
  if (!tmnCode || !secretKey || process.env.PAYMENT_MOCK_MODE === "true") {
    // Return a local mock URL that simulates the VNPAY flow within the app
    const mockUrl = `${frontendUrl}/payment/mock?orderId=${order.id}&amount=${order.total_amount}`;
    res.status(200).json({
      success: true,
      data: { paymentUrl: mockUrl, isMock: true }
    });
    return;
  }

  const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const url = generateVnpayUrl(
    ipAddr as string,
    String(order.id),
    Number(order.total_amount),
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
      if (order && order.payment_status !== "PAID") {
        await markOrderPaid(orderId);
      }
    }
    
    res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } else {
    res.status(200).json({ RspCode: "97", Message: "Invalid checksum" });
  }
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
});

