import { Request, Response } from "express";

import { AppError } from "../../errors/app-error";
import {
  findUserById,
  listUsers,
  createUser,
  findUserByEmail
} from "../../repositories/user.repository";
import { asyncHandler } from "../../utils/async-handler";
import { hashPassword } from "../../services/password.service";
import { adminCreateUserSchema } from "../auth/auth.validator";

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await listUsers();

  res.status(200).json({
    success: true,
    data: users.map((u) => ({
      id: String(u.id),
      email: u.email || "",
      fullName: u.full_name,
      role: (u as any).Role?.name || "USER",
      createdAt: u.created_at,
      updatedAt: u.updated_at
    }))
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await findUserById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: (user as any).Role?.name || "USER",
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  });
});

export const createUserByAdmin = asyncHandler(async (req: Request, res: Response) => {
  const payload = adminCreateUserSchema.parse(req.body);

  const existing = await findUserByEmail(payload.email);
  if (existing) {
    throw new AppError("Email already exists", 409);
  }

  const newUser = await createUser({
    email: payload.email,
    password: await hashPassword(payload.password),
    fullName: payload.fullName,
    role: payload.role
  });

  if (!newUser) {
    throw new AppError("Failed to create user", 500);
  }

  res.status(201).json({
    success: true,
    data: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      role: (newUser as any).Role?.name || "USER",
      createdAt: newUser.created_at,
      updatedAt: newUser.updated_at
    }
  });
});