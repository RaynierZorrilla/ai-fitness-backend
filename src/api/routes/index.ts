import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);

// aquí luego: /auth, /profile, /routines, etc.
// router.use("/profile", profileRouter);
// ...

export const apiRouter = router;
