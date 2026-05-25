import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";
import { HttpError } from "./error.js";

export const AUTH_COOKIE = "pk_auth";

export interface AuthPayload {
  uid: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthPayload;
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return next(new HttpError(401, "Unauthorized"));
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired session"));
  }
};

export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE];
  if (token) {
    try {
      req.user = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    } catch {}
  }
  next();
};

export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}
