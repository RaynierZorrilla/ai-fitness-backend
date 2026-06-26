import { AppDataSource } from "@config/data-source";
import { MealPlan, MealPlanMacros } from "@domain/entities/meal-plan.entity";
import { MealPlanDay } from "@domain/entities/meal-plan-day.entity";
import { FitnessGoal } from "@domain/entities/profile.entity";
import { RoutineDayOfWeek } from "@domain/entities/routine-day.entity";

export interface MealPlanDayInput {
  dayOfWeek: RoutineDayOfWeek;
  position: number;
  mealsSchema: any;
}

export interface CreateMealPlanInput {
  userId: string;
  title: string;
  description: string;
  goal: FitnessGoal;
  dailyCalories: number;
  macros: MealPlanMacros;
  aiModel: string;
  aiPromptVersion: string;
  days: MealPlanDayInput[];
}

export class NutritionRepository {
  private repo = AppDataSource.getRepository(MealPlan);

  async deactivateAllForUser(userId: string): Promise<void> {
    await this.repo.update({ userId, isActive: true }, { isActive: false });
  }

  async createMealPlanWithDays(input: CreateMealPlanInput): Promise<MealPlan> {
    const mealPlan = this.repo.create({
      userId: input.userId,
      title: input.title,
      description: input.description,
      goal: input.goal,
      dailyCalories: input.dailyCalories,
      macros: input.macros,
      aiModel: input.aiModel,
      aiPromptVersion: input.aiPromptVersion,
      isActive: true,
      days: input.days.map((d) => {
        const day = new MealPlanDay();
        day.dayOfWeek = d.dayOfWeek;
        day.position = d.position;
        day.mealsSchema = d.mealsSchema;
        return day;
      }),
    });

    return this.repo.save(mealPlan);
  }

  async findActiveByUserId(userId: string): Promise<MealPlan | null> {
    return this.repo.findOne({
      where: { userId, isActive: true },
      relations: ["days"],
      order: { days: { position: "ASC" } },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<MealPlan | null> {
    return this.repo.findOne({
      where: { id, userId },
      relations: ["days"],
      order: { days: { position: "ASC" } },
    });
  }

  async findHistoryByUserId(userId: string): Promise<MealPlan[]> {
    return this.repo.find({
      where: { userId },
      relations: ["days"],
      order: { isActive: "DESC", createdAt: "DESC", days: { position: "ASC" } },
    });
  }
}
