import { Request, Response } from "express";

import { AppError } from "../../errors/app-error";
import { createUser, findUserByEmail, findUserByPhone, findUserById } from "../../repositories/user.repository";
import { hashPassword, verifyPassword } from "../../services/password.service";
import { signAccessToken, signRefreshToken } from "../../services/token.service";
import { asyncHandler } from "../../utils/async-handler";
import { loginSchema, registerSchema } from "./auth.validator";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);

  const existing = await findUserByEmail(payload.email);
  if (existing) {
    throw new AppError("Email already exists", 400);
  }

  if (payload.phone) {
    const existingPhone = await findUserByPhone(payload.phone);
    if (existingPhone) {
      throw new AppError("Số điện thoại đã tồn tại", 400);
    }
  }

  const user = await createUser({
    email: payload.email,
    password: await hashPassword(payload.password),
    fullName: payload.fullName || payload.full_name,
    phone: payload.phone
  });

  if (!user) {
    throw new AppError("Error creating user", 500);
  }

  const tokenPayload = { 
    userId: String(user.id), 
    email: user.email || "", 
    role: (user as any).Role?.name || "USER" 
  };

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email || "",
        fullName: user.full_name,
        role: (user as any).Role?.name || "USER"
      },
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload)
    }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);

  const user = await findUserByEmail(payload.email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await verifyPassword(payload.password, user.password || "");
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const tokenPayload = { 
    userId: String(user.id), 
    email: user.email || "", 
    role: (user as any).Role?.name || "USER" 
  };

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email || "",
        fullName: user.full_name,
        role: (user as any).Role?.name || "USER"
      },
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload)
    }
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.userId) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await findUserById(req.user.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email || "",
      fullName: user.full_name,
      phone: user.phone,
      role: (user as any).Role?.name || "USER"
    }
  });
});

export const googleMock = asyncHandler(async (req: Request, res: Response) => {
  const { email, fullName } = req.body;
  if (!email) throw new AppError("Email is required", 400);

  let user = await findUserByEmail(email);
  
  if (!user) {
    // Create a new user for this mock google account
    user = await createUser({
      email,
      fullName: fullName || "Google User",
      password: "google-mock-password-" + Math.random().toString(36).slice(-8),
    });
  }

  if (!user) throw new AppError("Error processing google login", 500);

  const tokenPayload = { 
    userId: String(user.id), 
    email: user.email || "", 
    role: (user as any).Role?.name || "USER" 
  };

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email || "",
        fullName: user.full_name,
        role: (user as any).Role?.name || "USER"
      },
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload)
    }
  });
});

export const getMyAddresses = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.userId) {
    throw new AppError("Unauthorized", 401);
  }

  const userId = req.user.userId;

  const { prisma } = await import("../../config/prisma");
  const addresses = await prisma.address.findMany({
    where: { user_id: Number(userId) },
    orderBy: { created_at: "desc" }
  });

  res.status(200).json({
    success: true,
    data: addresses
  });
});

export const createMyAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.userId) {
    throw new AppError("Unauthorized", 401);
  }

  const userId = req.user.userId;
  const { full_name, phone, address_line, ward, district, province } = req.body;

  if (!full_name || !phone || !address_line || !ward || !district || !province) {
     throw new AppError("Vui lòng cung cấp đầy đủ thông tin địa chỉ", 400);
  }

  const { prisma } = await import("../../config/prisma");
  const newAddress = await prisma.address.create({
    data: {
      user_id: Number(userId),
      full_name,
      phone,
      address_line,
      ward,
      district,
      province
    }
  });

  res.status(201).json({
    success: true,
    data: newAddress
  });
});
