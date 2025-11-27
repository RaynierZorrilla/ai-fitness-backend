import { Router } from "express";
import { HealthController } from "../controllers/health.controller";

const router = Router();
const controller = new HealthController();

router.get("/", (req, res) => controller.getHealth(req, res));

export const healthRouter = router;
