import { FitnessAnalyticsRepository } from "@infrastructure/repositories/fitness-analytics.repository";

export class FitnessAnalyticsService {
  constructor(private readonly fitnessAnalyticsRepository: FitnessAnalyticsRepository) {}

  async getFitnessOverview(userId: string) {
    const currentWeekStart = this.getCurrentWeekStart();
    const [workoutMetrics, weightRange, waistRange, activeRoutine] = await Promise.all([
      this.fitnessAnalyticsRepository.getWorkoutMetrics(userId, currentWeekStart),
      this.fitnessAnalyticsRepository.getProgressMetricRange(userId, "weightKg"),
      this.fitnessAnalyticsRepository.getProgressMetricRange(userId, "waistCm"),
      this.fitnessAnalyticsRepository.findActiveRoutineByUserId(userId),
    ]);

    return {
      totalSessions: workoutMetrics.totalSessions,
      averageDifficulty: this.roundToOneDecimal(workoutMetrics.averageDifficulty),
      weightChangeKg: this.calculateChange(weightRange.first?.weightKg, weightRange.latest?.weightKg),
      waistChangeCm: this.calculateChange(waistRange.first?.waistCm, waistRange.latest?.waistCm),
      adherencePercentage: this.calculateAdherencePercentage(
        workoutMetrics.currentWeekSessions,
        activeRoutine?.days?.length ?? 0
      ),
    };
  }

  private calculateChange(first: number | null | undefined, latest: number | null | undefined) {
    if (first === undefined || first === null || latest === undefined || latest === null) {
      return 0;
    }

    return this.roundToOneDecimal(latest - first);
  }

  private calculateAdherencePercentage(currentWeekSessions: number, plannedSessions: number) {
    if (plannedSessions <= 0) return 0;

    return Math.min(100, Math.round((currentWeekSessions / plannedSessions) * 100));
  }

  private getCurrentWeekStart(): Date {
    const now = new Date();
    const start = new Date(now);
    const day = start.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;

    start.setDate(start.getDate() - daysSinceMonday);
    start.setHours(0, 0, 0, 0);

    return start;
  }

  private roundToOneDecimal(value: number): number {
    return Math.round(value * 10) / 10;
  }
}
