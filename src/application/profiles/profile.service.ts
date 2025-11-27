import { ProfileRepository } from "@infrastructure/repositories/profile.repository";
import { HttpException } from "@shared/http-exception";
import {
  ExperienceLevel,
  FitnessGoal,
  Gender,
  Profile,
} from "@domain/entities/profile.entity";

interface UpdateProfileInput {
  age?: number | null;
  gender?: Gender | null;
  heightCm?: number | null;
  weightKg?: number | null;
  experienceLevel?: ExperienceLevel | null;
  fitnessGoal?: FitnessGoal | null;
  availableEquipment?: string[];
  injuries?: string[];
  workoutDaysPerWeek?: number | null;
  minutesPerSession?: number | null;
}

export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getOrCreateProfile(userId: string): Promise<Profile> {
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      profile = await this.profileRepository.createForUser(userId);
    }
    return profile;
  }

  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new HttpException(404, "Profile not found");
    }
    return profile;
  }

  async upsertProfile(userId: string, data: UpdateProfileInput): Promise<Profile> {
    let profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      profile = await this.profileRepository.createForUser(userId);
    }

    profile.age = data.age ?? profile.age;
    profile.gender = data.gender ?? profile.gender;
    profile.heightCm = data.heightCm ?? profile.heightCm;
    profile.weightKg = data.weightKg ?? profile.weightKg;
    profile.experienceLevel = data.experienceLevel ?? profile.experienceLevel;
    profile.fitnessGoal = data.fitnessGoal ?? profile.fitnessGoal;
    profile.availableEquipment =
      data.availableEquipment ?? profile.availableEquipment;
    profile.injuries = data.injuries ?? profile.injuries;
    profile.workoutDaysPerWeek =
      data.workoutDaysPerWeek ?? profile.workoutDaysPerWeek;
    profile.minutesPerSession =
      data.minutesPerSession ?? profile.minutesPerSession;

    return this.profileRepository.save(profile);
  }
}
