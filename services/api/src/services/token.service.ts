import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env";
import type { AuthTokenPayload } from "../types/auth";

export function signAccessToken(payload: AuthTokenPayload) {
  const options: SignOptions = {
    expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.jwtAccessSecret, options);
}

export function signRefreshToken(payload: AuthTokenPayload) {
  const options: SignOptions = {
    expiresIn: env.jwtRefreshExpiresIn as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.jwtRefreshSecret, options);
}