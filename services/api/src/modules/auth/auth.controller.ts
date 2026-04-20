import { Request, Response } from "express";

import { AppError } from "../../errors/app-error";
import { createUser, findUserByEmail } from "../../repositories/user.repository";
import { hashPassword, verifyPassword } from "../../services/password.service";
import { signAccessToken, signRefreshToken } from "../../services/token.service";
import { asyncHandler } from "../../utils/async-handler";
import { loginSchema, registerSchema } from "./auth.validator";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);

  const existing = await findUserByEmail(payload.email);
  if (existing) {
    throw new AppError("Email already exists", 409);
  }

  const user = await createUser({
    email: payload.email,
    password: await hashPassword(payload.password),
    fullName: payload.fullName
  });

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      tokens: {
        accessToken: signAccessToken(tokenPayload),
        refreshToken: signRefreshToken(tokenPayload)
      }
    }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);

  const user = await findUserByEmail(payload.email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await verifyPassword(payload.password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      tokens: {
        accessToken: signAccessToken(tokenPayload),
        refreshToken: signRefreshToken(tokenPayload)
      }
    }
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  res.status(200).json({
    success: true,
    data: req.user
  });
});
