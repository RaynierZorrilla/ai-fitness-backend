import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middleware/auth.middleware";
import { ProgressEntryService } from "application/progress/progress-entry.service";
import { ProgressEntryRepository } from "@infrastructure/repositories/progress-entry.repository";

const progressEntryRepository = new ProgressEntryRepository();
const progressEntryService = new ProgressEntryService(progressEntryRepository);

export class ProgressEntryController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const entry = await progressEntryService.createEntry(req.user.id, req.body);

      return res.status(201).json({ entry });
    } catch (error) {
      next(error);
    }
  }

  async history(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const entries = await progressEntryService.getHistory(req.user.id);

      return res.json({ entries });
    } catch (error) {
      next(error);
    }
  }

  async latest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const entry = await progressEntryService.getLatest(req.user.id);

      return res.json({ entry });
    } catch (error) {
      next(error);
    }
  }
}
