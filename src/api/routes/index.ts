import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { profileRouter } from "./profile.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);

// aquí luego: /auth, /profile, /routines, etc.
// ...

export const apiRouter = router;
