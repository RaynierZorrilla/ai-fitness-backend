import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middleware/auth.middleware";
import { RoutineRepository } from "@infrastructure/repositories/routine.repository";
import { WorkoutSessionRepository } from "@infrastructure/repositories/workout-session.repository";
import { WorkoutSessionService } from "application/workouts/workout-session.service";

const workoutSessionRepository = new WorkoutSessionRepository();
const routineRepository = new RoutineRepository();
const workoutSessionService = new WorkoutSessionService(
  workoutSessionRepository,
  routineRepository
);

export class WorkoutSessionController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const session = await workoutSessionService.createSession(req.user.id, req.body);

      return res.status(201).json({ session });
    } catch (error) {
      next(error);
    }
  }

  async summary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const summary = await workoutSessionService.getSummary(req.user.id);

      return res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  async history(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const sessions = await workoutSessionService.getHistory(req.user.id);

      return res.json({ sessions });
    } catch (error) {
      next(error);
    }
  }
}
