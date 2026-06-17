import { AppDataSource } from "@config/data-source";
import { Routine, RoutineGoal } from "@domain/entities/routine.entity";
import { RoutineDay, RoutineDayOfWeek } from "@domain/entities/routine-day.entity";

export interface RoutineDayInput {
  dayOfWeek: RoutineDayOfWeek;
  position: number;
  exercisesSchema: any; // JSON con ejercicios del día
}

export interface CreateRoutineInput {
  userId: string;
  title: string;
  description: string;
  goal: RoutineGoal;
  aiModel: string;
  aiPromptVersion: string;
  days: RoutineDayInput[];
}

export class RoutineRepository {
  private repo = AppDataSource.getRepository(Routine);

  async deactivateAllForUser(userId: string): Promise<void> {
    await this.repo.update(
      { userId, isActive: true },
      { isActive: false }
    );
  }

  async createRoutineWithDays(input: CreateRoutineInput): Promise<Routine> {
    const routine = this.repo.create({
      userId: input.userId,
      title: input.title,
      description: input.description,
      goal: input.goal,
      aiModel: input.aiModel,
      aiPromptVersion: input.aiPromptVersion,
      isActive: true,
      days: input.days.map((d) => {
        const day = new RoutineDay();
        day.dayOfWeek = d.dayOfWeek;
        day.position = d.position;
        day.exercisesSchema = d.exercisesSchema;
        return day;
      }),
    });

    return this.repo.save(routine);
  }

  async findActiveByUserId(userId: string): Promise<Routine | null> {
    return this.repo.findOne({
      where: { userId, isActive: true },
      relations: ["days"],
      order: { days: { position: "ASC" } },
    });
  }

  async findById(id: string): Promise<Routine | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["days"],
      order: { days: { position: "ASC" } },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Routine | null> {
    return this.repo.findOne({
      where: { id, userId },
      relations: ["days"],
      order: { days: { position: "ASC" } },
    });
  }

  async findHistoryByUserId(userId: string): Promise<Routine[]> {
    return this.repo.find({
      where: { userId },
      relations: ["days"],
      order: { isActive: "DESC", createdAt: "DESC", days: { position: "ASC" } },
    });
  }
}
