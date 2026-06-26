import { env } from "@config/env";
import { MealPlan } from "@domain/entities/meal-plan.entity";
import { FitnessGoal } from "@domain/entities/profile.entity";
import { RoutineDayOfWeek } from "@domain/entities/routine-day.entity";
import { AiMealPlanDay, CohereNutritionAdapter } from "@infrastructure/ai/cohere-nutrition.adapter";
import { FitnessAnalyticsRepository } from "@infrastructure/repositories/fitness-analytics.repository";
import { NutritionRepository } from "@infrastructure/repositories/nutrition.repository";
import { ProfileRepository } from "@infrastructure/repositories/profile.repository";
import { ProgressEntryRepository } from "@infrastructure/repositories/progress-entry.repository";
import { RoutineRepository } from "@infrastructure/repositories/routine.repository";
import { WorkoutSessionRepository } from "@infrastructure/repositories/workout-session.repository";
import { FitnessAnalyticsService } from "../analytics/fitness-analytics.service";
import { WorkoutSessionService } from "../workouts/workout-session.service";
import { HttpException } from "@shared/http-exception";

export class NutritionService {
  constructor(
    private readonly nutritionRepository: NutritionRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly progressEntryRepository: ProgressEntryRepository,
    private readonly routineRepository: RoutineRepository,
    private readonly fitnessAnalyticsService: FitnessAnalyticsService,
    private readonly workoutSessionService: WorkoutSessionService,
    private readonly cohereNutritionAdapter: CohereNutritionAdapter
  ) {}

  async generateMealPlanForUser(userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new HttpException(400, "Profile not found. Complete your profile first.");
    }

    if (!profile.fitnessGoal || !profile.weightKg) {
      throw new HttpException(
        400,
        "Incomplete profile. Please set fitness goal and current weight."
      );
    }

    const [fitnessOverview, latestProgress, currentRoutine, workoutSummary] = await Promise.all([
      this.fitnessAnalyticsService.getFitnessOverview(userId),
      this.progressEntryRepository.findLatestByUserId(userId),
      this.routineRepository.findActiveByUserId(userId),
      this.workoutSessionService.getSummary(userId),
    ]);

    const aiMealPlan = await this.cohereNutritionAdapter.generateMealPlanFromContext({
      profile,
      fitnessOverview,
      latestProgress,
      currentRoutine,
      workoutSummary,
    });

    await this.nutritionRepository.deactivateAllForUser(userId);

    const mealPlan = await this.nutritionRepository.createMealPlanWithDays({
      userId,
      title: aiMealPlan.title,
      description: aiMealPlan.description,
      goal: (aiMealPlan.goal ?? profile.fitnessGoal) as FitnessGoal,
      dailyCalories: aiMealPlan.dailyCalories,
      macros: aiMealPlan.macros,
      aiModel: env.cohere.modelCommand,
      aiPromptVersion: "v1",
      days: this.mapAiDaysToRepoDays(aiMealPlan.days),
    });

    return this.toDto(mealPlan);
  }

  async getCurrentMealPlan(userId: string) {
    const mealPlan = await this.nutritionRepository.findActiveByUserId(userId);
    if (!mealPlan) return null;
    return this.toDto(mealPlan);
  }

  async getMealPlanHistory(userId: string) {
    const mealPlans = await this.nutritionRepository.findHistoryByUserId(userId);
    return mealPlans.map((mealPlan) => this.toSummaryDto(mealPlan));
  }

  async getMealPlanById(userId: string, mealPlanId: string) {
    const mealPlan = await this.nutritionRepository.findByIdAndUserId(mealPlanId, userId);
    if (!mealPlan) {
      throw new HttpException(404, "Meal plan not found");
    }

    return this.toDto(mealPlan);
  }

  private mapAiDaysToRepoDays(aiDays: AiMealPlanDay[]) {
    return aiDays.map((day, index) => ({
      dayOfWeek: day.dayOfWeek as RoutineDayOfWeek,
      position: index + 1,
      mealsSchema: {
        meals: day.meals,
      },
    }));
  }

  private toDto(mealPlan: MealPlan) {
    const sortedDays = this.sortDays(mealPlan.days ?? []);

    return {
      id: mealPlan.id,
      title: mealPlan.title,
      description: mealPlan.description,
      goal: mealPlan.goal,
      dailyCalories: mealPlan.dailyCalories,
      macros: mealPlan.macros,
      days: sortedDays.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        meals: day.mealsSchema?.meals ?? [],
      })),
    };
  }

  private toSummaryDto(mealPlan: MealPlan) {
    return {
      id: mealPlan.id,
      title: mealPlan.title,
      description: mealPlan.description,
      goal: mealPlan.goal,
      dailyCalories: mealPlan.dailyCalories,
      macros: mealPlan.macros,
      isActive: mealPlan.isActive,
      createdAt: mealPlan.createdAt,
      dayCount: mealPlan.days?.length ?? 0,
    };
  }

  private sortDays(days: any[]) {
    return [...days].sort((a, b) => a.position - b.position);
  }
}
