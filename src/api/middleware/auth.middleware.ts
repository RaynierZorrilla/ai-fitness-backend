import { NextFunction, Request, Response } from "express";
import { JwtProvider } from "@infrastructure/security/jwt.provider";
import { HttpException } from "@shared/http-exception";

const jwtProvider = new JwtProvider();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers["authorization"];

  if (!header || !header.startsWith("Bearer ")) {
    return next(new HttpException(401, "Missing or invalid authorization header"));
  }

  const token = header.substring("Bearer ".length);

  try {
    const payload = jwtProvider.verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    next();
  } catch (error) {
    next(new HttpException(401, "Invalid or expired token"));
  }
}
