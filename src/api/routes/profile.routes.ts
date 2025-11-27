import { Router } from "express";
import { ProfileController } from "@api/controllers/profile/profile.controller";
import { authMiddleware } from "@api/middleware/auth.middleware";

const router = Router();
const controller = new ProfileController();

// GET /api/profile
router.get("/", authMiddleware, (req, res, next) =>
  controller.getProfile(req, res, next)
);

// PUT /api/profile
router.put("/", authMiddleware, (req, res, next) =>
  controller.updateProfile(req, res, next)
);

export const profileRouter = router;
