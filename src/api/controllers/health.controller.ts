import { Request, Response } from "express";

export class HealthController {
  async getHealth(_req: Request, res: Response) {
    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }
}
