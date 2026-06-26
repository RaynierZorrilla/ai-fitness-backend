import request from "supertest";

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn(),
};

const mockProfileService = {
  getOrCreateProfile: jest.fn(),
  upsertProfile: jest.fn(),
};

const mockRoutineService = {
  generateRoutineForUser: jest.fn(),
  getCurrentRoutine: jest.fn(),
  adjustRoutineForUser: jest.fn(),
  getRoutineHistory: jest.fn(),
  getRoutineById: jest.fn(),
};

const mockWorkoutSessionService = {
  createSession: jest.fn(),
  getSummary: jest.fn(),
  getHistory: jest.fn(),
};

const mockProgressEntryService = {
  createEntry: jest.fn(),
  getHistory: jest.fn(),
  getLatest: jest.fn(),
};

const mockFitnessAnalyticsService = {
  getFitnessOverview: jest.fn(),
};

const mockNutritionService = {
  generateMealPlanForUser: jest.fn(),
  getCurrentMealPlan: jest.fn(),
  getMealPlanHistory: jest.fn(),
  getMealPlanById: jest.fn(),
};

jest.mock("@infrastructure/repositories/user.repository", () => ({
  UserRepository: jest.fn(),
}));

jest.mock("@infrastructure/repositories/profile.repository", () => ({
  ProfileRepository: jest.fn(),
}));

jest.mock("@infrastructure/repositories/routine.repository", () => ({
  RoutineRepository: jest.fn(),
}));

jest.mock("@infrastructure/repositories/workout-session.repository", () => ({
  WorkoutSessionRepository: jest.fn(),
}));

jest.mock("@infrastructure/repositories/progress-entry.repository", () => ({
  ProgressEntryRepository: jest.fn(),
}));

jest.mock("@infrastructure/repositories/fitness-analytics.repository", () => ({
  FitnessAnalyticsRepository: jest.fn(),
}));

jest.mock("@infrastructure/repositories/nutrition.repository", () => ({
  NutritionRepository: jest.fn(),
}));

jest.mock("@infrastructure/ai/cohere-routine.adapter", () => ({
  CohereRoutineAdapter: jest.fn(),
}));

jest.mock("@infrastructure/ai/cohere-nutrition.adapter", () => ({
  CohereNutritionAdapter: jest.fn(),
}));

jest.mock("@infrastructure/security/password-hasher", () => ({
  PasswordHasher: jest.fn(),
}));

jest.mock("@infrastructure/security/jwt.provider", () => ({
  JwtProvider: jest.fn().mockImplementation(() => ({
    verifyAccessToken: jest.fn((token: string) => {
      if (token !== "valid-token") {
        throw new Error("invalid token");
      }

      return { sub: "user-1", email: "user@example.com" };
    }),
  })),
}));

jest.mock("application/auth/auth.service", () => ({
  AuthService: jest.fn().mockImplementation(() => mockAuthService),
}));

jest.mock("application/profiles/profile.service", () => ({
  ProfileService: jest.fn().mockImplementation(() => mockProfileService),
}));

jest.mock("application/routines/routine-ai.service", () => ({
  RoutineAiService: jest.fn(),
}));

jest.mock("application/routines/routine.service", () => ({
  RoutineService: jest.fn().mockImplementation(() => mockRoutineService),
}));

jest.mock("application/workouts/workout-session.service", () => ({
  WorkoutSessionService: jest.fn().mockImplementation(() => mockWorkoutSessionService),
}));

jest.mock("application/progress/progress-entry.service", () => ({
  ProgressEntryService: jest.fn().mockImplementation(() => mockProgressEntryService),
}));

jest.mock("application/analytics/fitness-analytics.service", () => ({
  FitnessAnalyticsService: jest.fn().mockImplementation(() => mockFitnessAnalyticsService),
}));

jest.mock("application/nutrition/nutrition.service", () => ({
  NutritionService: jest.fn().mockImplementation(() => mockNutritionService),
}));

import { createApp } from "../../src/app";

const app = createApp();
const authHeader = { Authorization: "Bearer valid-token" };

describe("API endpoints", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.clearAllMocks();
  });

  it("GET /api/health returns service status", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body).toEqual({
      status: "ok",
      timestamp: expect.any(String),
    });
  });

  it("POST /api/auth/register delegates to AuthService", async () => {
    const result = {
      user: { id: "user-1", email: "user@example.com", name: "Ray" },
      accessToken: "access-token",
    };
    mockAuthService.register.mockResolvedValue(result);

    const payload = { email: "user@example.com", password: "secret", name: "Ray" };
    const response = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .expect(201);

    expect(mockAuthService.register).toHaveBeenCalledWith(payload);
    expect(response.body).toEqual(result);
  });

  it("POST /api/auth/login delegates to AuthService", async () => {
    const result = {
      user: { id: "user-1", email: "user@example.com" },
      accessToken: "access-token",
    };
    mockAuthService.login.mockResolvedValue(result);

    const payload = { email: "user@example.com", password: "secret" };
    const response = await request(app).post("/api/auth/login").send(payload).expect(200);

    expect(mockAuthService.login).toHaveBeenCalledWith(payload);
    expect(response.body).toEqual(result);
  });

  it("GET /api/auth/me uses the authenticated user id", async () => {
    const user = { id: "user-1", email: "user@example.com", name: "Ray" };
    mockAuthService.getMe.mockResolvedValue(user);

    const response = await request(app)
      .get("/api/auth/me")
      .set(authHeader)
      .expect(200);

    expect(mockAuthService.getMe).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ user });
  });

  it("rejects protected endpoints without a bearer token", async () => {
    const response = await request(app).get("/api/auth/me").expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: "Missing or invalid authorization header",
    });
  });

  it("GET /api/profile returns the profile for the authenticated user", async () => {
    const profile = buildProfile();
    mockProfileService.getOrCreateProfile.mockResolvedValue(profile);

    const response = await request(app)
      .get("/api/profile")
      .set(authHeader)
      .expect(200);

    expect(mockProfileService.getOrCreateProfile).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ profile });
  });

  it("PUT /api/profile updates the authenticated user profile", async () => {
    const profile = buildProfile({ fitnessGoal: "hypertrophy" });
    mockProfileService.upsertProfile.mockResolvedValue(profile);

    const payload = {
      age: 32,
      gender: "male",
      heightCm: 180,
      weightKg: 82,
      experienceLevel: "intermediate",
      fitnessGoal: "hypertrophy",
      availableEquipment: ["dumbbells"],
      injuries: [],
      workoutDaysPerWeek: 4,
      minutesPerSession: 60,
    };

    const response = await request(app)
      .put("/api/profile")
      .set(authHeader)
      .send(payload)
      .expect(200);

    expect(mockProfileService.upsertProfile).toHaveBeenCalledWith("user-1", payload);
    expect(response.body).toEqual({ profile });
  });

  it("POST /api/routines/generate creates a routine", async () => {
    const routine = buildRoutine();
    mockRoutineService.generateRoutineForUser.mockResolvedValue(routine);

    const response = await request(app)
      .post("/api/routines/generate")
      .set(authHeader)
      .expect(201);

    expect(mockRoutineService.generateRoutineForUser).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ routine });
  });

  it("GET /api/routines/current returns the current routine", async () => {
    const routine = buildRoutine();
    mockRoutineService.getCurrentRoutine.mockResolvedValue(routine);

    const response = await request(app)
      .get("/api/routines/current")
      .set(authHeader)
      .expect(200);

    expect(mockRoutineService.getCurrentRoutine).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ routine });
  });

  it("POST /api/routines/adjust returns the adjustment result", async () => {
    const adjustment = {
      previousRoutine: buildRoutine({ id: "routine-old" }),
      newRoutine: buildRoutine({ id: "routine-new" }),
      analytics: { totalSessions: 6 },
    };
    mockRoutineService.adjustRoutineForUser.mockResolvedValue(adjustment);

    const response = await request(app)
      .post("/api/routines/adjust")
      .set(authHeader)
      .expect(201);

    expect(mockRoutineService.adjustRoutineForUser).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual(adjustment);
  });

  it("GET /api/routines/history returns routine history", async () => {
    const routines = [buildRoutine()];
    mockRoutineService.getRoutineHistory.mockResolvedValue(routines);

    const response = await request(app)
      .get("/api/routines/history")
      .set(authHeader)
      .expect(200);

    expect(mockRoutineService.getRoutineHistory).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ routines });
  });

  it("GET /api/routines/:id returns a routine owned by the user", async () => {
    const routine = buildRoutine({ id: "routine-1" });
    mockRoutineService.getRoutineById.mockResolvedValue(routine);

    const response = await request(app)
      .get("/api/routines/routine-1")
      .set(authHeader)
      .expect(200);

    expect(mockRoutineService.getRoutineById).toHaveBeenCalledWith("user-1", "routine-1");
    expect(response.body).toEqual({ routine });
  });

  it("POST /api/workouts/sessions creates a workout session", async () => {
    const session = buildWorkoutSession();
    mockWorkoutSessionService.createSession.mockResolvedValue(session);

    const payload = {
      routineId: "routine-1",
      dayId: "day-1",
      performedAt: "2026-06-26T10:00:00.000Z",
      totalSeconds: 2400,
      completedExercises: 5,
      completedSets: 15,
      estimatedCalories: 320,
      difficultyRating: 7,
    };

    const response = await request(app)
      .post("/api/workouts/sessions")
      .set(authHeader)
      .send(payload)
      .expect(201);

    expect(mockWorkoutSessionService.createSession).toHaveBeenCalledWith("user-1", payload);
    expect(response.body).toEqual({ session });
  });

  it("GET /api/workouts/summary returns workout summary", async () => {
    const summary = {
      totalSessions: 12,
      currentWeekSessions: 3,
      totalCalories: 2400,
      totalWorkoutTimeMinutes: 480,
    };
    mockWorkoutSessionService.getSummary.mockResolvedValue(summary);

    const response = await request(app)
      .get("/api/workouts/summary")
      .set(authHeader)
      .expect(200);

    expect(mockWorkoutSessionService.getSummary).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual(summary);
  });

  it("GET /api/workouts/history returns workout history", async () => {
    const sessions = [buildWorkoutSession()];
    mockWorkoutSessionService.getHistory.mockResolvedValue(sessions);

    const response = await request(app)
      .get("/api/workouts/history")
      .set(authHeader)
      .expect(200);

    expect(mockWorkoutSessionService.getHistory).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ sessions });
  });

  it("POST /api/progress creates a progress entry", async () => {
    const entry = buildProgressEntry();
    mockProgressEntryService.createEntry.mockResolvedValue(entry);

    const payload = {
      weightKg: 81,
      bodyFatPercentage: 18,
      chestCm: 102,
      waistCm: 84,
      armsCm: 36,
      legsCm: 58,
      notes: "Felt strong",
      recordedAt: "2026-06-26T10:00:00.000Z",
    };

    const response = await request(app)
      .post("/api/progress")
      .set(authHeader)
      .send(payload)
      .expect(201);

    expect(mockProgressEntryService.createEntry).toHaveBeenCalledWith("user-1", payload);
    expect(response.body).toEqual({ entry });
  });

  it("GET /api/progress/history returns progress history", async () => {
    const entries = [buildProgressEntry()];
    mockProgressEntryService.getHistory.mockResolvedValue(entries);

    const response = await request(app)
      .get("/api/progress/history")
      .set(authHeader)
      .expect(200);

    expect(mockProgressEntryService.getHistory).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ entries });
  });

  it("GET /api/progress/latest returns the latest progress entry", async () => {
    const entry = buildProgressEntry();
    mockProgressEntryService.getLatest.mockResolvedValue(entry);

    const response = await request(app)
      .get("/api/progress/latest")
      .set(authHeader)
      .expect(200);

    expect(mockProgressEntryService.getLatest).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ entry });
  });

  it("GET /api/analytics/fitness-overview returns fitness analytics", async () => {
    const overview = {
      workouts: { totalSessions: 12, currentWeekSessions: 3, averageDifficulty: 6.5 },
      progress: { weightChangeKg: -2, waistChangeCm: -3 },
      currentRoutine: buildRoutine(),
    };
    mockFitnessAnalyticsService.getFitnessOverview.mockResolvedValue(overview);

    const response = await request(app)
      .get("/api/analytics/fitness-overview")
      .set(authHeader)
      .expect(200);

    expect(mockFitnessAnalyticsService.getFitnessOverview).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual(overview);
  });

  it("POST /api/nutrition/generate creates a meal plan", async () => {
    const mealPlan = buildMealPlan();
    mockNutritionService.generateMealPlanForUser.mockResolvedValue(mealPlan);

    const response = await request(app)
      .post("/api/nutrition/generate")
      .set(authHeader)
      .expect(201);

    expect(mockNutritionService.generateMealPlanForUser).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ mealPlan });
  });

  it("GET /api/nutrition/current returns the current meal plan", async () => {
    const mealPlan = buildMealPlan();
    mockNutritionService.getCurrentMealPlan.mockResolvedValue(mealPlan);

    const response = await request(app)
      .get("/api/nutrition/current")
      .set(authHeader)
      .expect(200);

    expect(mockNutritionService.getCurrentMealPlan).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ mealPlan });
  });

  it("GET /api/nutrition/history returns meal plan history", async () => {
    const mealPlans = [buildMealPlan()];
    mockNutritionService.getMealPlanHistory.mockResolvedValue(mealPlans);

    const response = await request(app)
      .get("/api/nutrition/history")
      .set(authHeader)
      .expect(200);

    expect(mockNutritionService.getMealPlanHistory).toHaveBeenCalledWith("user-1");
    expect(response.body).toEqual({ mealPlans });
  });

  it("GET /api/nutrition/:id returns a meal plan owned by the user", async () => {
    const mealPlan = buildMealPlan({ id: "meal-plan-1" });
    mockNutritionService.getMealPlanById.mockResolvedValue(mealPlan);

    const response = await request(app)
      .get("/api/nutrition/meal-plan-1")
      .set(authHeader)
      .expect(200);

    expect(mockNutritionService.getMealPlanById).toHaveBeenCalledWith(
      "user-1",
      "meal-plan-1"
    );
    expect(response.body).toEqual({ mealPlan });
  });
});

function buildProfile(overrides = {}) {
  return {
    age: 32,
    gender: "male",
    heightCm: 180,
    weightKg: 82,
    experienceLevel: "intermediate",
    fitnessGoal: "strength",
    availableEquipment: ["dumbbells", "barbell"],
    injuries: [],
    workoutDaysPerWeek: 4,
    minutesPerSession: 60,
    ...overrides,
  };
}

function buildRoutine(overrides = {}) {
  return {
    id: "routine-1",
    title: "Strength Plan",
    description: "Four day split",
    goal: "strength",
    isActive: true,
    days: [
      {
        id: "day-1",
        dayOfWeek: "monday",
        position: 1,
        exercisesSchema: [{ name: "Squat", sets: 4, reps: 5 }],
      },
    ],
    ...overrides,
  };
}

function buildWorkoutSession(overrides = {}) {
  return {
    id: "session-1",
    routineId: "routine-1",
    dayId: "day-1",
    performedAt: "2026-06-26T10:00:00.000Z",
    totalSeconds: 2400,
    completedExercises: 5,
    completedSets: 15,
    estimatedCalories: 320,
    difficultyRating: 7,
    ...overrides,
  };
}

function buildProgressEntry(overrides = {}) {
  return {
    id: "progress-1",
    weightKg: 81,
    bodyFatPercentage: 18,
    chestCm: 102,
    waistCm: 84,
    armsCm: 36,
    legsCm: 58,
    notes: "Felt strong",
    recordedAt: "2026-06-26T10:00:00.000Z",
    ...overrides,
  };
}

function buildMealPlan(overrides = {}) {
  return {
    id: "meal-plan-1",
    title: "Plan nutricional para ganancia muscular",
    description: "Plan semanal basado en rutina, progreso y adherencia.",
    goal: "gain_muscle",
    dailyCalories: 2800,
    macros: {
      proteinG: 180,
      carbsG: 330,
      fatsG: 80,
    },
    isActive: true,
    days: [
      {
        id: "meal-day-1",
        dayOfWeek: "monday",
        position: 1,
        meals: [
          {
            name: "Desayuno",
            calories: 650,
            proteinG: 40,
            carbsG: 80,
            fatsG: 18,
            foods: ["Avena", "Huevos", "Guineo"],
          },
        ],
      },
    ],
    ...overrides,
  };
}
