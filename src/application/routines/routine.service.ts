import { RoutineRepository } from "@infrastructure/repositories/routine.repository";
import { RoutineAiService } from "./routine-ai.service";
import { env } from "@config/env";
import { AiRoutine, AiRoutineDay } from "@infrastructure/ai/cohere-routine.adapter";
import { RoutineGoal } from "@domain/entities/routine.entity";

export class RoutineService {
  constructor(
    private readonly routineRepository: RoutineRepository,
    private readonly routineAiService: RoutineAiService
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

  private toDto(routine: any) {
    return {
      id: routine.id,
      title: routine.title,
      description: routine.description,
      goal: routine.goal,
      days: routine.days
        .sort((a: any, b: any) => a.position - b.position)
        .map((d: any) => ({
          id: d.id,
          dayOfWeek: d.dayOfWeek,
          position: d.position,
          focus: d.exercisesSchema?.focus,
          exercises: d.exercisesSchema?.exercises ?? [],
        })),
    };
  }
}
