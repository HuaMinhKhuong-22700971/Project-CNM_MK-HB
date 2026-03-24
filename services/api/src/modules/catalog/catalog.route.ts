import { Router } from "express";

import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
  catalogAdminRoles,
  getCategories,
  getProductDetail,
  getProducts,
  patchProduct,
  postCategory,
  postProduct
} from "./catalog.controller";

export const catalogRouter = Router();

catalogRouter.get("/categories", getCategories);
catalogRouter.get("/products", getProducts);
catalogRouter.get("/products/:id", getProductDetail);

catalogRouter.post("/categories", authenticate, authorize(catalogAdminRoles), postCategory);
catalogRouter.post("/products", authenticate, authorize(catalogAdminRoles), postProduct);
catalogRouter.patch("/products/:id", authenticate, authorize(catalogAdminRoles), patchProduct);
