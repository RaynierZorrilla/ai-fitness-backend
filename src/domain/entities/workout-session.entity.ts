import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Routine } from "./routine.entity";
import { RoutineDay } from "./routine-day.entity";

@Entity("workout_sessions")
export class WorkoutSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @ManyToOne(() => Routine)
  @JoinColumn({ name: "routine_id" })
  routine!: Routine;

  @Column({ name: "routine_id", type: "uuid" })
  routineId!: string;

  @ManyToOne(() => RoutineDay)
  @JoinColumn({ name: "day_id" })
  day!: RoutineDay;

  @Column({ name: "day_id", type: "uuid" })
  dayId!: string;

  @Column({ name: "performed_at", type: "timestamptz" })
  performedAt!: Date;

  @Column({ name: "total_seconds", type: "int", default: 0 })
  totalSeconds!: number;

  @Column({ name: "completed_exercises", type: "int", default: 0 })
  completedExercises!: number;

  @Column({ name: "completed_sets", type: "int", default: 0 })
  completedSets!: number;

  @Column({ name: "estimated_calories", type: "int", default: 0 })
  estimatedCalories!: number;

  @Column({ name: "difficulty_rating", type: "int", nullable: true })
  difficultyRating!: number | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
