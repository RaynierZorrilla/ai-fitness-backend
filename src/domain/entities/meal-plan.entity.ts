import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { MealPlanDay } from "./meal-plan-day.entity";
import { FitnessGoal } from "./profile.entity";

export interface MealPlanMacros {
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

@Entity("meal_plans")
export class MealPlan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 20 })
  goal!: FitnessGoal;

  @Column({ name: "daily_calories", type: "int" })
  dailyCalories!: number;

  @Column({ type: "jsonb" })
  macros!: MealPlanMacros;

  @Column({ name: "ai_model", type: "varchar", length: 100 })
  aiModel!: string;

  @Column({ name: "ai_prompt_version", type: "varchar", length: 50 })
  aiPromptVersion!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => MealPlanDay, (day) => day.mealPlan, {
    cascade: true,
  })
  days!: MealPlanDay[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
