import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { MealPlan } from "./meal-plan.entity";
import { RoutineDayOfWeek } from "./routine-day.entity";

@Entity("meal_plan_days")
export class MealPlanDay {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => MealPlan, (mealPlan) => mealPlan.days, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "meal_plan_id" })
  mealPlan!: MealPlan;

  @Column({ name: "meal_plan_id", type: "uuid" })
  mealPlanId!: string;

  @Column({ name: "day_of_week", type: "varchar", length: 10 })
  dayOfWeek!: RoutineDayOfWeek;

  @Column({ type: "int" })
  position!: number;

  @Column({ name: "meals_schema", type: "jsonb" })
  mealsSchema!: any;
}
