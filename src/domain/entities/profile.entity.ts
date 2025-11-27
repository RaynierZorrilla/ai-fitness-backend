import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { User } from "./user.entity";
  
  export type Gender = "male" | "female" | "other";
  export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
  export type FitnessGoal =
    | "lose_fat"
    | "gain_muscle"
    | "maintenance"
    | "recomposition";
  
  @Entity("profiles")
  export class Profile {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @OneToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;
  
    @Column({ name: "user_id", type: "uuid", unique: true })
    userId!: string;
  
    @Column({ type: "int", nullable: true })
    age!: number | null;
  
    @Column({ type: "varchar", length: 10, nullable: true })
    gender!: Gender | null;
  
    @Column({ name: "height_cm", type: "float", nullable: true })
    heightCm!: number | null;
  
    @Column({ name: "weight_kg", type: "float", nullable: true })
    weightKg!: number | null;
  
    @Column({ name: "experience_level", type: "varchar", length: 20, nullable: true })
    experienceLevel!: ExperienceLevel | null;
  
    @Column({ name: "fitness_goal", type: "varchar", length: 20, nullable: true })
    fitnessGoal!: FitnessGoal | null;
  
    @Column({ name: "available_equipment", type: "text", array: true, default: "{}" })
    availableEquipment!: string[];
  
    @Column({ type: "text", array: true, default: "{}" })
    injuries!: string[];
  
    @Column({ name: "workout_days_per_week", type: "int", nullable: true })
    workoutDaysPerWeek!: number | null;
  
    @Column({ name: "minutes_per_session", type: "int", nullable: true })
    minutesPerSession!: number | null;
  
    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
  
    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
  }
  