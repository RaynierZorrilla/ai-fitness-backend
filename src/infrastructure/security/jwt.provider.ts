import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { env } from "@config/env";

interface JwtPayload {
  sub: string; // user id
  email: string;
}

export class JwtProvider {
  generateAccessToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };

    const options: SignOptions = {
        expiresIn: env.jwt.accessExpiresIn as any
    };

    return jwt.sign(
      payload,
      env.jwt.accessSecret as Secret,
      options
    );
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwt.accessSecret as Secret) as JwtPayload;
  }
}
