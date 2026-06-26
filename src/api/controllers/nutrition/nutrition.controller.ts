import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middleware/auth.middleware";
import { CohereNutritionAdapter } from "@infrastructure/ai/cohere-nutrition.adapter";
import { FitnessAnalyticsRepository } from "@infrastructure/repositories/fitness-analytics.repository";
import { NutritionRepository } from "@infrastructure/repositories/nutrition.repository";
import { ProfileRepository } from "@infrastructure/repositories/profile.repository";
import { ProgressEntryRepository } from "@infrastructure/repositories/progress-entry.repository";
import { RoutineRepository } from "@infrastructure/repositories/routine.repository";
import { WorkoutSessionRepository } from "@infrastructure/repositories/workout-session.repository";
import { FitnessAnalyticsService } from "application/analytics/fitness-analytics.service";
import { NutritionService } from "application/nutrition/nutrition.service";
import { WorkoutSessionService } from "application/workouts/workout-session.service";

const nutritionRepository = new NutritionRepository();
const profileRepository = new ProfileRepository();
const progressEntryRepository = new ProgressEntryRepository();
const routineRepository = new RoutineRepository();
const fitnessAnalyticsRepository = new FitnessAnalyticsRepository();
const fitnessAnalyticsService = new FitnessAnalyticsService(fitnessAnalyticsRepository);
const workoutSessionRepository = new WorkoutSessionRepository();
const workoutSessionService = new WorkoutSessionService(
  workoutSessionRepository,
  routineRepository
);
const cohereNutritionAdapter = new CohereNutritionAdapter();
const nutritionService = new NutritionService(
  nutritionRepository,
  profileRepository,
  progressEntryRepository,
  routineRepository,
  fitnessAnalyticsService,
  workoutSessionService,
  cohereNutritionAdapter
);

export class NutritionController {
  async generate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const mealPlan = await nutritionService.generateMealPlanForUser(req.user.id);

      return res.status(201).json({ mealPlan });
    } catch (error) {
      next(error);
    }
  }

  async getCurrent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const mealPlan = await nutritionService.getCurrentMealPlan(req.user.id);

      return res.json({ mealPlan });
    } catch (error) {
      next(error);
    }
  }

  async history(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const mealPlans = await nutritionService.getMealPlanHistory(req.user.id);

      return res.json({ mealPlans });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const mealPlan = await nutritionService.getMealPlanById(req.user.id, req.params.id);

      return res.json({ mealPlan });
    } catch (error) {
      next(error);
    }
  }
}
