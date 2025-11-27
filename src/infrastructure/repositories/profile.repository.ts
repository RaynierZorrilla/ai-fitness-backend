import { AppDataSource } from "@config/data-source";
import { Profile } from "@domain/entities/profile.entity";

export class ProfileRepository {
  private repo = AppDataSource.getRepository(Profile);

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.repo.findOne({ where: { userId } });
  }

  async createForUser(userId: string): Promise<Profile> {
    const profile = this.repo.create({
      userId,
      age: null,
      gender: null,
      heightCm: null,
      weightKg: null,
      experienceLevel: null,
      fitnessGoal: null,
      availableEquipment: [],
      injuries: [],
      workoutDaysPerWeek: null,
      minutesPerSession: null,
    });

    return this.repo.save(profile);
  }

  async save(profile: Profile): Promise<Profile> {
    return this.repo.save(profile);
  }
}
