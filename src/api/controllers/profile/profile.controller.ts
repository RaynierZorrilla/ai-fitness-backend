import { Response, NextFunction } from "express";
import { ProfileRepository } from "@infrastructure/repositories/profile.repository";
import { AuthenticatedRequest } from "@api/middleware/auth.middleware";
import { ProfileService } from "application/profiles/profile.service";

const profileRepository = new ProfileRepository();
const profileService = new ProfileService(profileRepository);

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const profile = await profileService.getOrCreateProfile(req.user.id);

      return res.json({
        profile: {
          age: profile.age,
          gender: profile.gender,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          experienceLevel: profile.experienceLevel,
          fitnessGoal: profile.fitnessGoal,
          availableEquipment: profile.availableEquipment,
          injuries: profile.injuries,
          workoutDaysPerWeek: profile.workoutDaysPerWeek,
          minutesPerSession: profile.minutesPerSession,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const {
        age,
        gender,
        heightCm,
        weightKg,
        experienceLevel,
        fitnessGoal,
        availableEquipment,
        injuries,
        workoutDaysPerWeek,
        minutesPerSession,
      } = req.body;

      const profile = await profileService.upsertProfile(req.user.id, {
        age,
        gender,
        heightCm,
        weightKg,
        experienceLevel,
        fitnessGoal,
        availableEquipment,
        injuries,
        workoutDaysPerWeek,
        minutesPerSession,
      });

      return res.json({
        profile: {
          age: profile.age,
          gender: profile.gender,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          experienceLevel: profile.experienceLevel,
          fitnessGoal: profile.fitnessGoal,
          availableEquipment: profile.availableEquipment,
          injuries: profile.injuries,
          workoutDaysPerWeek: profile.workoutDaysPerWeek,
          minutesPerSession: profile.minutesPerSession,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
