import { MoreThanOrEqual, Not, IsNull } from "typeorm";
import { AppDataSource } from "@config/data-source";
import { ProgressEntry } from "@domain/entities/progress-entry.entity";
import { Routine } from "@domain/entities/routine.entity";
import { WorkoutSession } from "@domain/entities/workout-session.entity";

export interface WorkoutAnalyticsMetrics {
  totalSessions: number;
  currentWeekSessions: number;
  averageDifficulty: number;
}

export interface ProgressMetricRange {
  first: ProgressEntry | null;
  latest: ProgressEntry | null;
}

export class FitnessAnalyticsRepository {
  private workoutSessionRepo = AppDataSource.getRepository(WorkoutSession);
  private progressEntryRepo = AppDataSource.getRepository(ProgressEntry);
  private routineRepo = AppDataSource.getRepository(Routine);

  async getWorkoutMetrics(
    userId: string,
    currentWeekStart: Date
  ): Promise<WorkoutAnalyticsMetrics> {
    const [totals, currentWeekSessions] = await Promise.all([
      this.workoutSessionRepo
        .createQueryBuilder("session")
        .select("COUNT(session.id)", "totalSessions")
        .addSelect("COALESCE(AVG(session.difficulty_rating), 0)", "averageDifficulty")
        .where("session.user_id = :userId", { userId })
        .getRawOne<{ totalSessions: string; averageDifficulty: string }>(),
      this.workoutSessionRepo.count({
        where: {
          userId,
          performedAt: MoreThanOrEqual(currentWeekStart),
        },
      }),
    ]);

    return {
      totalSessions: Number(totals?.totalSessions ?? 0),
      currentWeekSessions,
      averageDifficulty: Number(totals?.averageDifficulty ?? 0),
    };
  }

  async getProgressMetricRange(
    userId: string,
    field: "weightKg" | "waistCm"
  ): Promise<ProgressMetricRange> {
    const where = { userId, [field]: Not(IsNull()) } as any;

    const [first, latest] = await Promise.all([
      this.progressEntryRepo.findOne({
        where,
        order: { recordedAt: "ASC", createdAt: "ASC" },
      }),
      this.progressEntryRepo.findOne({
        where,
        order: { recordedAt: "DESC", createdAt: "DESC" },
      }),
    ]);

    return { first, latest };
  }

  async findActiveRoutineByUserId(userId: string): Promise<Routine | null> {
    return this.routineRepo.findOne({
      where: { userId, isActive: true },
      relations: ["days"],
      order: { days: { position: "ASC" } },
    });
  }
}
