import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { login, me, register, googleMock, getMyAddresses, createMyAddress } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/google-mock", googleMock);
authRouter.get("/me", authenticate, me);
authRouter.get("/me/addresses", authenticate, getMyAddresses);
authRouter.post("/me/addresses", authenticate, createMyAddress);
