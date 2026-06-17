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

@Entity("progress_entries")
export class ProgressEntry {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "weight_kg", type: "double precision", nullable: true })
  weightKg!: number | null;

  @Column({ name: "body_fat_percentage", type: "double precision", nullable: true })
  bodyFatPercentage!: number | null;

  @Column({ name: "chest_cm", type: "double precision", nullable: true })
  chestCm!: number | null;

  @Column({ name: "waist_cm", type: "double precision", nullable: true })
  waistCm!: number | null;

  @Column({ name: "arms_cm", type: "double precision", nullable: true })
  armsCm!: number | null;

  @Column({ name: "legs_cm", type: "double precision", nullable: true })
  legsCm!: number | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ name: "recorded_at", type: "timestamptz" })
  recordedAt!: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
