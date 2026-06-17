import { RoutineRepository } from "@infrastructure/repositories/routine.repository";
import {
  CreateWorkoutSessionInput,
  WorkoutSessionRepository,
} from "@infrastructure/repositories/workout-session.repository";
import { HttpException } from "@shared/http-exception";

export interface CreateWorkoutSessionDto {
  routineId?: string;
  dayId?: string;
  performedAt?: string;
  totalSeconds?: number;
  completedExercises?: number;
  completedSets?: number;
  estimatedCalories?: number;
  difficultyRating?: number | null;
}

export class WorkoutSessionService {
  constructor(
    private readonly workoutSessionRepository: WorkoutSessionRepository,
    private readonly routineRepository: RoutineRepository
  ) {}

  async createSession(userId: string, input: CreateWorkoutSessionDto) {
    if (!input.routineId) {
      throw new HttpException(400, "routineId is required");
    }

    if (!input.dayId) {
      throw new HttpException(400, "dayId is required");
    }

    const routine = await this.routineRepository.findById(input.routineId);
    if (!routine || routine.userId !== userId) {
      throw new HttpException(404, "Routine not found");
    }

    const dayBelongsToRoutine = routine.days.some((day) => day.id === input.dayId);
    if (!dayBelongsToRoutine) {
      throw new HttpException(400, "dayId does not belong to routineId");
    }

    const performedAt = this.parsePerformedAt(input.performedAt);
    const createInput: CreateWorkoutSessionInput = {
      userId,
      routineId: input.routineId,
      dayId: input.dayId,
      performedAt,
      totalSeconds: this.parseNonNegativeInteger(input.totalSeconds, "totalSeconds"),
      completedExercises: this.parseNonNegativeInteger(
        input.completedExercises,
        "completedExercises"
      ),
      completedSets: this.parseNonNegativeInteger(input.completedSets, "completedSets"),
      estimatedCalories: this.parseNonNegativeInteger(
        input.estimatedCalories,
        "estimatedCalories"
      ),
      difficultyRating: this.parseDifficultyRating(input.difficultyRating),
    };

    const session = await this.workoutSessionRepository.createSession(createInput);
    return this.toDto(session);
  }

  async getSummary(userId: string) {
    return this.workoutSessionRepository.getSummary(userId, this.getCurrentWeekStart());
  }

  async getHistory(userId: string) {
    const sessions = await this.workoutSessionRepository.findHistoryByUserId(userId);
    return sessions.map((session) => this.toDto(session));
  }

  private parsePerformedAt(value: string | undefined): Date {
    if (!value) return new Date();

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new HttpException(400, "performedAt must be a valid ISO date");
    }

    return date;
  }

  private parseNonNegativeInteger(value: number | undefined, field: string): number {
    if (value === undefined) return 0;

    if (!Number.isInteger(value) || value < 0) {
      throw new HttpException(400, `${field} must be a non-negative integer`);
    }

    return value;
  }

  private parseDifficultyRating(value: number | null | undefined): number | null {
    if (value === undefined || value === null) return null;

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new HttpException(400, "difficultyRating must be an integer between 1 and 5");
    }

    return value;
  }

  private getCurrentWeekStart(): Date {
    const now = new Date();
    const start = new Date(now);
    const day = start.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;

    start.setDate(start.getDate() - daysSinceMonday);
    start.setHours(0, 0, 0, 0);

    return start;
  }

  private toDto(session: any) {
    return {
      id: session.id,
      userId: session.userId,
      routineId: session.routineId,
      dayId: session.dayId,
      performedAt: session.performedAt,
      totalSeconds: session.totalSeconds,
      completedExercises: session.completedExercises,
      completedSets: session.completedSets,
      estimatedCalories: session.estimatedCalories,
      difficultyRating: session.difficultyRating,
    };
  }
}
