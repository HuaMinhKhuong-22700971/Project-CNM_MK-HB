import { Router } from "express";

import { ROLES } from "../../constants/roles";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
  checkout,
  getAllOrders,
  getMyOrders,
  getOrderDetail,
  patchOrderStatus,
  payOrderMock,
  createVnpayUrl,
  vnpayReturn,
  vnpayIpn
} from "./orders.controller";

export const ordersRouter = Router();

ordersRouter.get("/vnpay/return", vnpayReturn);
ordersRouter.get("/vnpay/ipn", vnpayIpn);

ordersRouter.use(authenticate);

ordersRouter.post("/checkout", checkout);
ordersRouter.get("/my", getMyOrders);
ordersRouter.get("/:id", getOrderDetail);
ordersRouter.post("/:id/vnpay-url", createVnpayUrl);

ordersRouter.get("/", authorize([ROLES.ADMIN, ROLES.SALES]), getAllOrders);
ordersRouter.patch("/:id/status", authorize([ROLES.ADMIN, ROLES.SALES]), patchOrderStatus);
ordersRouter.post("/:id/pay", authorize([ROLES.ADMIN, ROLES.SALES]), payOrderMock);
