import { Router } from "express";

import { ROLES } from "../../constants/roles";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { createUserByAdmin, getUserById, getUsers } from "./users.controller";

export const usersRouter = Router();

usersRouter.use(authenticate, authorize([ROLES.ADMIN]));

usersRouter.get("/", getUsers);
usersRouter.get("/:id", getUserById);
usersRouter.post("/", createUserByAdmin);
