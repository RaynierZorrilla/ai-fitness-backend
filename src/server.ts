import "reflect-metadata";
import { createApp } from "./app";
import { env } from "./config/env";
import { AppDataSource } from "./config/data-source";

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const app = createApp();
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

