import { cohereClient } from "./cohere.client";
import { env } from "@config/env";
import { FitnessGoal, Profile } from "@domain/entities/profile.entity";
import { Routine } from "@domain/entities/routine.entity";
import { ProgressEntry } from "@domain/entities/progress-entry.entity";
import { WorkoutSummary } from "@infrastructure/repositories/workout-session.repository";
import { AiFitnessOverview } from "./cohere-routine.adapter";

export interface AiMeal {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  foods: string[];
}

export interface AiMealPlanDay {
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  meals: AiMeal[];
}

export interface AiMealPlan {
  title: string;
  description: string;
  goal: FitnessGoal;
  dailyCalories: number;
  macros: {
    proteinG: number;
    carbsG: number;
    fatsG: number;
  };
  days: AiMealPlanDay[];
}

export interface NutritionAiContext {
  profile: Profile;
  fitnessOverview: AiFitnessOverview;
  latestProgress: ProgressEntry | null;
  currentRoutine: Routine | null;
  workoutSummary: WorkoutSummary;
}

export class CohereNutritionAdapter {
  async generateMealPlanFromContext(context: NutritionAiContext): Promise<AiMealPlan> {
    const prompt = `
Eres un nutricionista deportivo profesional. Genera un plan nutricional semanal personalizado en JSON ESTRICTO.

Datos del perfil:
- Edad: ${context.profile.age ?? "desconocida"}
- Género: ${context.profile.gender ?? "desconocido"}
- Altura (cm): ${context.profile.heightCm ?? "desconocida"}
- Peso actual del perfil (kg): ${context.profile.weightKg ?? "desconocido"}
- Nivel de experiencia: ${context.profile.experienceLevel ?? "desconocido"}
- Objetivo principal (fitness_goal): ${context.profile.fitnessGoal ?? "desconocido"}
- Días de entrenamiento por semana: ${context.profile.workoutDaysPerWeek ?? "desconocido"}
- Minutos por sesión: ${context.profile.minutesPerSession ?? "desconocido"}
- Lesiones o limitaciones: ${(context.profile.injuries ?? []).join(", ") || "ninguna"}

Fitness overview:
${JSON.stringify(context.fitnessOverview, null, 2)}

Latest progress:
${JSON.stringify(this.toProgressContext(context.latestProgress), null, 2)}

Current routine:
${JSON.stringify(this.toRoutineContext(context.currentRoutine), null, 2)}

Workout summary:
${JSON.stringify(context.workoutSummary, null, 2)}

Requisitos:
- Ajusta calorías y macros al objetivo, peso actual, cambio de peso, adherencia y nivel de actividad.
- Usa alimentos comunes en Latinoamérica cuando sea razonable.
- Incluye 7 días.
- Cada día debe tener de 3 a 5 comidas.
- Las calorías de las comidas deben ser coherentes con dailyCalories.
- No incluyas recomendaciones médicas ni suplementos obligatorios.
- Devuelve JSON ESTRICTO y nada más fuera del JSON.

FORMATO JSON ESPERADO:

{
  "title": "string",
  "description": "string",
  "goal": "lose_fat | gain_muscle | maintenance | recomposition",
  "dailyCalories": number,
  "macros": {
    "proteinG": number,
    "carbsG": number,
    "fatsG": number
  },
  "days": [
    {
      "dayOfWeek": "monday | tuesday | wednesday | thursday | friday | saturday | sunday",
      "meals": [
        {
          "name": "string",
          "calories": number,
          "proteinG": number,
          "carbsG": number,
          "fatsG": number,
          "foods": ["string"]
        }
      ]
    }
  ]
}
`;

    const response = await cohereClient.chat({
      model: env.cohere.modelCommand,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      maxTokens: 3500,
      response_format: { type: "json_object" } as any,
    } as any);

    // @ts-ignore
    const rawText = response.message?.content?.[0]?.text ?? "";
    console.log("[CohereNutritionAdapter] Raw meal plan from Cohere:", rawText);

    const jsonText = this.extractBalancedJson(rawText);

    try {
      return JSON.parse(jsonText) as AiMealPlan;
    } catch (error) {
      console.error("[CohereNutritionAdapter] Error parsing JSON:", error);
      console.error("Raw jsonText:", jsonText);
      throw new Error("Failed to parse AI nutrition JSON");
    }
  }

  private toProgressContext(progress: ProgressEntry | null) {
    if (!progress) return null;

    return {
      weightKg: progress.weightKg,
      bodyFatPercentage: progress.bodyFatPercentage,
      chestCm: progress.chestCm,
      waistCm: progress.waistCm,
      armsCm: progress.armsCm,
      legsCm: progress.legsCm,
      notes: progress.notes,
      recordedAt: progress.recordedAt,
    };
  }

  private toRoutineContext(routine: Routine | null) {
    if (!routine) return null;

    return {
      id: routine.id,
      title: routine.title,
      description: routine.description,
      goal: routine.goal,
      days: (routine.days ?? [])
        .sort((a, b) => a.position - b.position)
        .map((day) => ({
          dayOfWeek: day.dayOfWeek,
          focus: day.exercisesSchema?.focus,
          exercises: day.exercisesSchema?.exercises ?? [],
        })),
    };
  }

  private extractJson(text: string): string {
    const fenced = text.match(/```json([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      return fenced[1].trim();
    }

    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return text.slice(firstBrace, lastBrace + 1).trim();
    }

    return text.trim();
  }

  private extractBalancedJson(text: string): string {
    const cleaned = this.extractJson(text);
    let depth = 0;
    let lastZeroIndex = -1;

    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) {
          lastZeroIndex = i;
        }
      }
    }

    if (lastZeroIndex !== -1) {
      return cleaned.slice(0, lastZeroIndex + 1);
    }

    return cleaned;
  }
}
