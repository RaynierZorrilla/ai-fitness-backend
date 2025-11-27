import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    // OneToOne
  } from "typeorm";
  // import { Profile } from "./profile.entity"; // lo añadiremos luego
  
  @Entity("users")
  export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @Column({ unique: true })
    email!: string;
  
    @Column({ name: "password_hash" })
    passwordHash!: string;
  
    @Column({
      type: "varchar",
      length: 255,
      nullable: true,
    })
    name!: string | null;
  
    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
  
    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
  
    // @OneToOne(() => Profile, (profile) => profile.user)
    // profile!: Profile;
  }
  