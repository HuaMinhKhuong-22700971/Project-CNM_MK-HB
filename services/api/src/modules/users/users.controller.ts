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
    data: users.map((u: {
      id: string;
      email: string;
      fullName: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
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
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
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

  res.status(201).json({
    success: true,
    data: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }
  });
});