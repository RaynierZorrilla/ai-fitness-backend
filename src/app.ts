import express from "express";
import cors from "cors";
import { apiRouter } from "./api/routes";
import { errorMiddleware } from "./api/middleware/error.middleware";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", apiRouter);

  app.use(errorMiddleware);

  return app;
};

