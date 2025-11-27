import { Router } from "express";
import { AuthController } from "@api/controllers/auth/auth.controller";
import { authMiddleware } from "@api/middleware/auth.middleware";

const router = Router();
const controller = new AuthController();

router.post("/register", (req, res, next) => controller.register(req, res, next));
router.post("/login", (req, res, next) => controller.login(req, res, next));
router.get("/me", authMiddleware, (req, res, next) => controller.me(req, res, next));

export const authRouter = router;
