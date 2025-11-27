import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 8000,

  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    name: process.env.DB_NAME || "ai_fitness_planner",
    logging: process.env.DB_LOGGING === "true",
    sync: process.env.DB_SYNC === "true"
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "super_secret_access_key",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "30m"
  },

  cohere: {
    apiKey: process.env.COHERE_API_KEY || "",
    modelCommand: process.env.COHERE_MODEL_COMMAND || "command-a-03-2025",
  },
};
