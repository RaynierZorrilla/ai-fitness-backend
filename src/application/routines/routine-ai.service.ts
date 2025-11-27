import { ProfileRepository } from "@infrastructure/repositories/profile.repository";
import { CohereRoutineAdapter, AiRoutine } from "@infrastructure/ai/cohere-routine.adapter";
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
}
