import { Router } from "express";
import { RoutineController } from "@api/controllers/routines/routine.controller";
import { authMiddleware } from "@api/middleware/auth.middleware";

const router = Router();
const controller = new RoutineController();

// Generar nueva rutina con IA (Cohere)
router.post("/generate", authMiddleware, (req, res, next) =>
  controller.generate(req, res, next)
);

// Obtener rutina activa actual
router.get("/current", authMiddleware, (req, res, next) =>
  controller.getCurrent(req, res, next)
);

export const routineRouter = router;
