import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middleware/auth.middleware";
import { RoutineRepository } from "@infrastructure/repositories/routine.repository";
import { ProfileRepository } from "@infrastructure/repositories/profile.repository";
import { CohereRoutineAdapter } from "@infrastructure/ai/cohere-routine.adapter";
import { RoutineAiService } from "application/routines/routine-ai.service";
import { RoutineService } from "application/routines/routine.service";

const routineRepository = new RoutineRepository();
const profileRepository = new ProfileRepository();
const cohereRoutineAdapter = new CohereRoutineAdapter();
const routineAiService = new RoutineAiService(
  profileRepository,
  cohereRoutineAdapter
);
const routineService = new RoutineService(routineRepository, routineAiService);

export class RoutineController {
  // POST /api/routines/generate
  async generate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const routine = await routineService.generateRoutineForUser(req.user.id);

      return res.status(201).json({ routine });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/routines/current
  async getCurrent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const routine = await routineService.getCurrentRoutine(req.user.id);

      return res.json({ routine });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/routines/history
  async history(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const routines = await routineService.getRoutineHistory(req.user.id);

      return res.json({ routines });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/routines/:id
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const routine = await routineService.getRoutineById(req.user.id, req.params.id);

      return res.json({ routine });
    } catch (error) {
      next(error);
    }
  }
}
