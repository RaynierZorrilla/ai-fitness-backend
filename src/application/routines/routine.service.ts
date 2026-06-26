import { RoutineRepository } from "@infrastructure/repositories/routine.repository";
import { RoutineAiService } from "./routine-ai.service";
import { env } from "@config/env";
import { AiRoutine, AiRoutineDay } from "@infrastructure/ai/cohere-routine.adapter";
import { Routine, RoutineGoal } from "@domain/entities/routine.entity";
import { HttpException } from "@shared/http-exception";
import { FitnessAnalyticsService } from "../analytics/fitness-analytics.service";

export class RoutineService {
  constructor(
    private readonly routineRepository: RoutineRepository,
    private readonly routineAiService: RoutineAiService,
    private readonly fitnessAnalyticsService: FitnessAnalyticsService
  ) {}

  // Genera una nueva rutina con IA, desactiva las anteriores y guarda la nueva
  async generateRoutineForUser(userId: string) {
    const aiRoutine = await this.routineAiService.generateRoutineForUser(userId);

    const goal = (aiRoutine.goal ?? "maintenance") as RoutineGoal;

    await this.routineRepository.deactivateAllForUser(userId);

    const routine = await this.routineRepository.createRoutineWithDays({
      userId,
      title: aiRoutine.title,
      description: aiRoutine.description,
      goal,
      aiModel: env.cohere.modelCommand,
      aiPromptVersion: "v1",
      days: this.mapAiDaysToRepoDays(aiRoutine.days),
    });

    return this.toDto(routine);
  }

  async getCurrentRoutine(userId: string) {
    const routine = await this.routineRepository.findActiveByUserId(userId);
    if (!routine) return null;
    return this.toDto(routine);
  }

  async getRoutineHistory(userId: string) {
    const routines = await this.routineRepository.findHistoryByUserId(userId);
    return routines.map((routine) => this.toSummaryDto(routine));
  }

  async getRoutineById(userId: string, routineId: string) {
    const routine = await this.routineRepository.findByIdAndUserId(routineId, userId);
    if (!routine) {
      throw new HttpException(404, "Routine not found");
    }

    return this.toDto(routine);
  }

  async adjustRoutineForUser(userId: string) {
    const currentRoutine = await this.routineRepository.findActiveByUserId(userId);
    if (!currentRoutine) {
      throw new HttpException(404, "Routine not found");
    }

    const fitnessOverview = await this.fitnessAnalyticsService.getFitnessOverview(userId);
    const adjustment = await this.routineAiService.adjustRoutineForUser(
      userId,
      currentRoutine,
      fitnessOverview
    );

    await this.routineRepository.deactivateAllForUser(userId);

    const goal = (adjustment.routine.goal ?? currentRoutine.goal) as RoutineGoal;
    const routine = await this.routineRepository.createRoutineWithDays({
      userId,
      title: adjustment.routine.title,
      description: adjustment.routine.description,
      goal,
      aiModel: env.cohere.modelCommand,
      aiPromptVersion: "adjust-v1",
      days: this.mapAiDaysToRepoDays(adjustment.routine.days),
    });

    return {
      analysis: adjustment.analysis,
      routine: this.toDto(routine),
    };
  }

  private mapAiDaysToRepoDays(aiDays: AiRoutineDay[]) {
    return aiDays.map((day, index) => ({
      dayOfWeek: day.dayOfWeek,
      position: index + 1,
      exercisesSchema: {
        focus: day.focus,
        exercises: day.exercises,
      },
    }));
  }

  private toDto(routine: Routine) {
    const sortedDays = this.sortDays(routine.days ?? []);

    return {
      id: routine.id,
      title: routine.title,
      description: routine.description,
      goal: routine.goal,
      isActive: routine.isActive,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
      dayCount: sortedDays.length,
      exerciseCount: this.countExercises(routine),
      days: sortedDays
        .map((d: any) => ({
          id: d.id,
          dayOfWeek: d.dayOfWeek,
          position: d.position,
          focus: d.exercisesSchema?.focus,
          exercises: d.exercisesSchema?.exercises ?? [],
        })),
    };
  }

  private toSummaryDto(routine: Routine) {
    return {
      id: routine.id,
      title: routine.title,
      description: routine.description,
      goal: routine.goal,
      isActive: routine.isActive,
      createdAt: routine.createdAt,
      dayCount: routine.days?.length ?? 0,
      exerciseCount: this.countExercises(routine),
    };
  }

  private sortDays(days: any[]) {
    return [...days].sort((a, b) => a.position - b.position);
  }

  private countExercises(routine: Routine): number {
    return (routine.days ?? []).reduce((total, day) => {
      const exercises = day.exercisesSchema?.exercises;
      return total + (Array.isArray(exercises) ? exercises.length : 0);
    }, 0);
  }
}
