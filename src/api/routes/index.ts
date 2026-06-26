import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { profileRouter } from "./profile.routes";
import { routineRouter } from "./routine.routes";
import { workoutRouter } from "./workout.routes";
import { progressRouter } from "./progress.routes";
import { analyticsRouter } from "./analytics.routes";
import { nutritionRouter } from "./nutrition.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/routines", routineRouter);
router.use("/workouts", workoutRouter);
router.use("/progress", progressRouter);
router.use("/analytics", analyticsRouter);
router.use("/nutrition", nutritionRouter);

export const apiRouter = router;
