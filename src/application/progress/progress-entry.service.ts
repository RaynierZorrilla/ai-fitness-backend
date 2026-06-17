import {
  CreateProgressEntryInput,
  ProgressEntryRepository,
} from "@infrastructure/repositories/progress-entry.repository";
import { HttpException } from "@shared/http-exception";

export interface CreateProgressEntryDto {
  weightKg?: number | null;
  bodyFatPercentage?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  armsCm?: number | null;
  legsCm?: number | null;
  notes?: string | null;
  recordedAt?: string;
}

export class ProgressEntryService {
  constructor(private readonly progressEntryRepository: ProgressEntryRepository) {}

  async createEntry(userId: string, input: CreateProgressEntryDto) {
    const createInput: CreateProgressEntryInput = {
      userId,
      weightKg: this.parseOptionalPositiveNumber(input.weightKg, "weightKg"),
      bodyFatPercentage: this.parseOptionalPercentage(
        input.bodyFatPercentage,
        "bodyFatPercentage"
      ),
      chestCm: this.parseOptionalPositiveNumber(input.chestCm, "chestCm"),
      waistCm: this.parseOptionalPositiveNumber(input.waistCm, "waistCm"),
      armsCm: this.parseOptionalPositiveNumber(input.armsCm, "armsCm"),
      legsCm: this.parseOptionalPositiveNumber(input.legsCm, "legsCm"),
      notes: this.parseOptionalText(input.notes, "notes"),
      recordedAt: this.parseRecordedAt(input.recordedAt),
    };

    if (!this.hasProgressValue(createInput)) {
      throw new HttpException(400, "At least one progress field is required");
    }

    const entry = await this.progressEntryRepository.createEntry(createInput);
    return this.toDto(entry);
  }

  async getHistory(userId: string) {
    const entries = await this.progressEntryRepository.findHistoryByUserId(userId);
    return entries.map((entry) => this.toDto(entry));
  }

  async getLatest(userId: string) {
    const entry = await this.progressEntryRepository.findLatestByUserId(userId);
    return entry ? this.toDto(entry) : null;
  }

  private parseOptionalPositiveNumber(
    value: number | null | undefined,
    field: string
  ): number | null {
    if (value === undefined || value === null) return null;

    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new HttpException(400, `${field} must be a non-negative number`);
    }

    return value;
  }

  private parseOptionalPercentage(value: number | null | undefined, field: string) {
    const parsed = this.parseOptionalPositiveNumber(value, field);
    if (parsed !== null && parsed > 100) {
      throw new HttpException(400, `${field} must be between 0 and 100`);
    }

    return parsed;
  }

  private parseOptionalText(value: string | null | undefined, field: string): string | null {
    if (value === undefined || value === null) return null;

    if (typeof value !== "string") {
      throw new HttpException(400, `${field} must be a string`);
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private parseRecordedAt(value: string | undefined): Date {
    if (!value) return new Date();

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new HttpException(400, "recordedAt must be a valid ISO date");
    }

    return date;
  }

  private hasProgressValue(input: CreateProgressEntryInput): boolean {
    return [
      input.weightKg,
      input.bodyFatPercentage,
      input.chestCm,
      input.waistCm,
      input.armsCm,
      input.legsCm,
      input.notes,
    ].some((value) => value !== null);
  }

  private toDto(entry: any) {
    return {
      id: entry.id,
      userId: entry.userId,
      weightKg: entry.weightKg,
      bodyFatPercentage: entry.bodyFatPercentage,
      chestCm: entry.chestCm,
      waistCm: entry.waistCm,
      armsCm: entry.armsCm,
      legsCm: entry.legsCm,
      notes: entry.notes,
      recordedAt: entry.recordedAt,
    };
  }
}
