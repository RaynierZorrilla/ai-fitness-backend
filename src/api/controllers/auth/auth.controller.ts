import { Request, Response, NextFunction } from "express";
import { AuthService } from "application/auth/auth.service";
import { UserRepository } from "@infrastructure/repositories/user.repository";
import { PasswordHasher } from "@infrastructure/security/password-hasher";
import { JwtProvider } from "@infrastructure/security/jwt.provider";
import { AuthenticatedRequest } from "@api/middleware/auth.middleware";

const userRepository = new UserRepository();
const passwordHasher = new PasswordHasher();
const jwtProvider = new JwtProvider();
const authService = new AuthService(userRepository, passwordHasher, jwtProvider);

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      // aquí luego podemos meter validación con Zod
      const result = await authService.register({ email, password, name });
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await authService.getMe(req.user.id);
      return res.json({ user: result });
    } catch (error) {
      next(error);
    }
  }
}
