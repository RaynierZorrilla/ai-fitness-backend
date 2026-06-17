import { Router } from "express";
import { authMiddleware } from "@api/middleware/auth.middleware";
import { WorkoutSessionController } from "@api/controllers/workouts/workout-session.controller";

const router = Router();
const controller = new WorkoutSessionController();

router.post("/sessions", authMiddleware, (req, res, next) =>
  controller.create(req, res, next)
);

router.get("/summary", authMiddleware, (req, res, next) =>
  controller.summary(req, res, next)
);

router.get("/history", authMiddleware, (req, res, next) =>
  controller.history(req, res, next)
);

export const workoutRouter = router;
