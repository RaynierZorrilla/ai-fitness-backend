import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from "typeorm";
  import { Routine } from "./routine.entity";
  
  export type RoutineDayOfWeek =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  
  @Entity("routine_days")
  export class RoutineDay {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @ManyToOne(() => Routine, (routine) => routine.days, {
      onDelete: "CASCADE",
    })
    @JoinColumn({ name: "routine_id" })
    routine!: Routine;
  
    @Column({ name: "routine_id", type: "uuid" })
    routineId!: string;
  
    @Column({ name: "day_of_week", type: "varchar", length: 10 })
    dayOfWeek!: RoutineDayOfWeek;
  
    @Column({ type: "int" })
    position!: number;
  
    // JSON con estructura de ejercicios para ese día
    @Column({ name: "exercises_schema", type: "jsonb" })
    exercisesSchema!: any;
  }
  