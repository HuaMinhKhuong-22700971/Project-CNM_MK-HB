import { Router } from "express";

import { authRouter } from "../modules/auth/auth.route";
import { cartRouter } from "../modules/cart/cart.route";
import { catalogRouter } from "../modules/catalog/catalog.route";
import { ordersRouter } from "../modules/orders/orders.route";
import { pcBuilderRouter } from "../modules/pc-builder/pc-builder.route";
import { ticketsRouter } from "../modules/tickets/tickets.route";
import { usersRouter } from "../modules/users/users.route";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString()
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/catalog", catalogRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/pc-builder", pcBuilderRouter);
apiRouter.use("/tickets", ticketsRouter);
