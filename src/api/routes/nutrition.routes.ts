import { Router } from "express";
import { NutritionController } from "@api/controllers/nutrition/nutrition.controller";
import { authMiddleware } from "@api/middleware/auth.middleware";

const router = Router();
const controller = new NutritionController();

router.post("/generate", authMiddleware, (req, res, next) =>
  controller.generate(req, res, next)
);

router.get("/current", authMiddleware, (req, res, next) =>
  controller.getCurrent(req, res, next)
);

router.get("/history", authMiddleware, (req, res, next) =>
  controller.history(req, res, next)
);

router.get("/:id", authMiddleware, (req, res, next) =>
  controller.getById(req, res, next)
);

export const nutritionRouter = router;
