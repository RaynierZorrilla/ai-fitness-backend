import { AppDataSource } from "@config/data-source";
import { ProgressEntry } from "@domain/entities/progress-entry.entity";

export interface CreateProgressEntryInput {
  userId: string;
  weightKg: number | null;
  bodyFatPercentage: number | null;
  chestCm: number | null;
  waistCm: number | null;
  armsCm: number | null;
  legsCm: number | null;
  notes: string | null;
  recordedAt: Date;
}

export class ProgressEntryRepository {
  private repo = AppDataSource.getRepository(ProgressEntry);

  async createEntry(input: CreateProgressEntryInput): Promise<ProgressEntry> {
    const entry = this.repo.create(input);
    return this.repo.save(entry);
  }

  async findHistoryByUserId(userId: string): Promise<ProgressEntry[]> {
    return this.repo.find({
      where: { userId },
      order: { recordedAt: "DESC", createdAt: "DESC" },
    });
  }

  async findLatestByUserId(userId: string): Promise<ProgressEntry | null> {
    return this.repo.findOne({
      where: { userId },
      order: { recordedAt: "DESC", createdAt: "DESC" },
    });
  }
}
