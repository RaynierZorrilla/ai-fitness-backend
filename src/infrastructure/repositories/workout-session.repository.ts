import { MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "@config/data-source";
import { WorkoutSession } from "@domain/entities/workout-session.entity";

export interface CreateWorkoutSessionInput {
  userId: string;
  routineId: string;
  dayId: string;
  performedAt: Date;
  totalSeconds: number;
  completedExercises: number;
  completedSets: number;
  estimatedCalories: number;
  difficultyRating: number | null;
}

export interface WorkoutSummary {
  totalSessions: number;
  currentWeekSessions: number;
  totalCalories: number;
  totalWorkoutTimeMinutes: number;
}

export class WorkoutSessionRepository {
  private repo = AppDataSource.getRepository(WorkoutSession);

  async createSession(input: CreateWorkoutSessionInput): Promise<WorkoutSession> {
    const session = this.repo.create(input);
    return this.repo.save(session);
  }

  async getSummary(userId: string, currentWeekStart: Date): Promise<WorkoutSummary> {
    const [totalSessions, currentWeekSessions, totals] = await Promise.all([
      this.repo.count({ where: { userId } }),
      this.repo.count({
        where: {
          userId,
          performedAt: MoreThanOrEqual(currentWeekStart),
        },
      }),
      this.repo
        .createQueryBuilder("session")
        .select("COALESCE(SUM(session.estimated_calories), 0)", "totalCalories")
        .addSelect("COALESCE(SUM(session.total_seconds), 0)", "totalSeconds")
        .where("session.user_id = :userId", { userId })
        .getRawOne<{ totalCalories: string; totalSeconds: string }>(),
    ]);

    return {
      totalSessions,
      currentWeekSessions,
      totalCalories: Number(totals?.totalCalories ?? 0),
      totalWorkoutTimeMinutes: Math.round(Number(totals?.totalSeconds ?? 0) / 60),
    };
  }

  async findHistoryByUserId(userId: string): Promise<WorkoutSession[]> {
    return this.repo.find({
      where: { userId },
      order: { performedAt: "DESC", createdAt: "DESC" },
    });
  }
}
