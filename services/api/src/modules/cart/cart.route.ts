import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import {
  clearMyCart,
  getMyCart,
  patchCartItem,
  postCartItem,
  removeCartItem
} from "./cart.controller";

export const cartRouter = Router();

cartRouter.use(authenticate);

cartRouter.get("/", getMyCart);
cartRouter.post("/items", postCartItem);
cartRouter.patch("/items/:itemId", patchCartItem);
cartRouter.delete("/items/:itemId", removeCartItem);
cartRouter.delete("/clear", clearMyCart);
