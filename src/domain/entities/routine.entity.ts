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
  import { RoutineDay } from "./routine-day.entity";
  
  export type RoutineGoal =
    | "lose_fat"
    | "gain_muscle"
    | "maintenance"
    | "recomposition";
  
  @Entity("routines")
  export class Routine {
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
    goal!: RoutineGoal;
  
    @Column({ name: "ai_model", type: "varchar", length: 100 })
    aiModel!: string;
  
    @Column({ name: "ai_prompt_version", type: "varchar", length: 50 })
    aiPromptVersion!: string;
  
    @Column({ name: "is_active", type: "boolean", default: true })
    isActive!: boolean;
  
    @OneToMany(() => RoutineDay, (day) => day.routine, {
      cascade: true,
    })
    days!: RoutineDay[];
  
    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
  
    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
  }
  