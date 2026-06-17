import { Router } from "express";
import { authMiddleware } from "@api/middleware/auth.middleware";
import { ProgressEntryController } from "@api/controllers/progress/progress-entry.controller";

const router = Router();
const controller = new ProgressEntryController();

router.post("/", authMiddleware, (req, res, next) => controller.create(req, res, next));

router.get("/history", authMiddleware, (req, res, next) =>
  controller.history(req, res, next)
);

router.get("/latest", authMiddleware, (req, res, next) =>
  controller.latest(req, res, next)
);

export const progressRouter = router;
