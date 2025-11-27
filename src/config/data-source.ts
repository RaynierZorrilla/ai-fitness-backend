import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { User } from "@domain/entities/user.entity";
import { Profile } from "@domain/entities/profile.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  synchronize: env.db.sync, // true en dev, false en prod
  logging: env.db.logging,
  entities: [User, Profile],
  migrations: [],
});
