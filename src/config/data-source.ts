import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { User } from "@domain/entities/user.entity";
import { Profile } from "@domain/entities/profile.entity";
import { Routine } from "@domain/entities/routine.entity";
import { RoutineDay } from "@domain/entities/routine-day.entity";
import { WorkoutSession } from "@domain/entities/workout-session.entity";
import { ProgressEntry } from "@domain/entities/progress-entry.entity";
import { MealPlan } from "@domain/entities/meal-plan.entity";
import { MealPlanDay } from "@domain/entities/meal-plan-day.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  synchronize: env.db.sync, // true en dev, false en prod
  logging: env.db.logging,
  entities: [
    User,
    Profile,
    Routine,
    RoutineDay,
    WorkoutSession,
    ProgressEntry,
    MealPlan,
    MealPlanDay,
  ],
  migrations: [],
});
