import { ProfileRepository } from "@infrastructure/repositories/profile.repository";
import {
  AiFitnessOverview,
  AiRoutine,
  AiRoutineAdjustment,
  CohereRoutineAdapter,
} from "@infrastructure/ai/cohere-routine.adapter";
import { Routine } from "@domain/entities/routine.entity";
import { HttpException } from "@shared/http-exception";

export class RoutineAiService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly cohereRoutineAdapter: CohereRoutineAdapter
  ) {}

  async generateRoutineForUser(userId: string): Promise<AiRoutine> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new HttpException(400, "Profile not found. Complete your profile first.");
    }

    if (!profile.fitnessGoal || !profile.workoutDaysPerWeek || !profile.minutesPerSession) {
      throw new HttpException(
        400,
        "Incomplete profile. Please set fitness goal, workout days per week and minutes per session."
      );
    }

    const aiRoutine = await this.cohereRoutineAdapter.generateRoutineFromProfile(
      profile
    );

    return aiRoutine;
  }

  async adjustRoutineForUser(
    userId: string,
    currentRoutine: Routine,
    fitnessOverview: AiFitnessOverview
  ): Promise<AiRoutineAdjustment> {
    const profile = await this.getValidProfile(userId);

    return this.cohereRoutineAdapter.adjustRoutineFromContext(
      profile,
      currentRoutine,
      fitnessOverview
    );
  }

  private async getValidProfile(userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new HttpException(400, "Profile not found. Complete your profile first.");
    }

    if (!profile.fitnessGoal || !profile.workoutDaysPerWeek || !profile.minutesPerSession) {
      throw new HttpException(
        400,
        "Incomplete profile. Please set fitness goal, workout days per week and minutes per session."
      );
    }

    return profile;
  }
}
