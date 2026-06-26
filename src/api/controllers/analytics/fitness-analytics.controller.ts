import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middleware/auth.middleware";
import { FitnessAnalyticsService } from "application/analytics/fitness-analytics.service";
import { FitnessAnalyticsRepository } from "@infrastructure/repositories/fitness-analytics.repository";

const fitnessAnalyticsRepository = new FitnessAnalyticsRepository();
const fitnessAnalyticsService = new FitnessAnalyticsService(fitnessAnalyticsRepository);

export class FitnessAnalyticsController {
  async overview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const overview = await fitnessAnalyticsService.getFitnessOverview(req.user.id);

      return res.json(overview);
    } catch (error) {
      next(error);
    }
  }
}
