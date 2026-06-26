import { Router } from "express";
import { authMiddleware } from "@api/middleware/auth.middleware";
import { FitnessAnalyticsController } from "@api/controllers/analytics/fitness-analytics.controller";

const router = Router();
const controller = new FitnessAnalyticsController();

router.get("/fitness-overview", authMiddleware, (req, res, next) =>
  controller.overview(req, res, next)
);

export const analyticsRouter = router;
