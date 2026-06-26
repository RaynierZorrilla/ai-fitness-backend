import { cohereClient } from "./cohere.client";
import { env } from "@config/env";
import {
    ExperienceLevel,
    FitnessGoal,
    Gender,
    Profile,
} from "@domain/entities/profile.entity";
import { Routine } from "@domain/entities/routine.entity";

export type AiIntensity = "low" | "medium" | "high";

export interface AiExercise {
    name: string;
    muscleGroup: string;
    sets: number;
    reps: string; // "8-12", "12"
    restSeconds: number;
    equipment: string;
    intensity: AiIntensity;
    notes?: string;
}

export interface AiRoutineDay {
    dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
    focus: string;
    exercises: AiExercise[];
}

export interface AiRoutine {
    title: string;
    description: string;
    goal: FitnessGoal;
    days: AiRoutineDay[];
}

export type AiProgressStatus = "improving" | "stable" | "declining" | "unknown";
export type AiFatigueLevel = "low" | "medium" | "high";
export type AiRecommendedAdjustment =
    | "reduce_volume"
    | "increase_difficulty"
    | "simplify_routine"
    | "maintain_direction"
    | "progress_load"
    | "change_focus";

export interface AiRoutineAdjustmentAnalysis {
    summary: string;
    progressStatus: AiProgressStatus;
    fatigueLevel: AiFatigueLevel;
    recommendedAdjustment: AiRecommendedAdjustment;
}

export interface AiFitnessOverview {
    totalSessions: number;
    averageDifficulty: number;
    weightChangeKg: number;
    waistChangeCm: number;
    adherencePercentage: number;
}

export interface AiRoutineAdjustment {
    analysis: AiRoutineAdjustmentAnalysis;
    routine: AiRoutine;
}

export class CohereRoutineAdapter {
    async generateRoutineFromProfile(profile: Profile): Promise<AiRoutine> {
        const {
            age,
            gender,
            heightCm,
            weightKg,
            experienceLevel,
            fitnessGoal,
            availableEquipment,
            injuries,
            workoutDaysPerWeek,
            minutesPerSession,
        } = profile;

        const prompt = `
Eres un entrenador personal profesional. Genera una rutina semanal de entrenamiento personalizada para gimnasio, en formato JSON ESTRICTO.

Datos del usuario:
- Edad: ${age ?? "desconocida"}
- Género: ${gender ?? "desconocido"}
- Altura (cm): ${heightCm ?? "desconocida"}
- Peso (kg): ${weightKg ?? "desconocido"}
- Nivel de experiencia: ${experienceLevel ?? "desconocido"}
- Objetivo principal (fitness_goal): ${fitnessGoal ?? "desconocido"}
- Días disponibles por semana: ${workoutDaysPerWeek ?? "desconocido"}
- Minutos por sesión: ${minutesPerSession ?? "desconocido"}
- Equipamiento disponible: ${(availableEquipment ?? []).join(", ") || "ninguno"}
- Lesiones o limitaciones: ${(injuries ?? []).join(", ") || "ninguna"}

Requisitos:
- Usa solo ejercicios realistas, seguros para el nivel del usuario.
- Ajusta volumen e intensidad al nivel y al objetivo.
- Respeta número de días y duración aproximada por sesión.
- Considera lesiones para evitar ejercicios peligrosos.

FORMATO JSON ESPERADO (NO incluyas nada más fuera del JSON):

{
  "title": "string",
  "description": "string",
  "goal": "lose_fat | gain_muscle | maintenance | recomposition",
  "days": [
    {
      "dayOfWeek": "monday | tuesday | wednesday | thursday | friday | saturday | sunday",
      "focus": "string",
      "exercises": [
        {
          "name": "string",
          "muscleGroup": "string",
          "sets": number,
          "reps": "string",
          "restSeconds": number,
          "equipment": "string",
          "intensity": "low | medium | high",
          "notes": "string opcional"
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
            temperature: 0.5,
            maxTokens: 2500,
            response_format: { type: "json_object" } as any,
        } as any);

        // @ts-ignore
        const rawText = response.message?.content?.[0]?.text ?? "";
        console.log("[CohereRoutineAdapter] Raw text from Cohere:", rawText);

        const jsonText = this.extractBalancedJson(rawText);

        let json: AiRoutine;
        try {
            json = JSON.parse(jsonText) as AiRoutine;
        } catch (error) {
            console.error("[CohereRoutineAdapter] Error parsing JSON:", error);
            console.error("Raw jsonText:", jsonText);
            throw new Error("Failed to parse AI routine JSON");
        }

        return json;
    }

    async adjustRoutineFromContext(
        profile: Profile,
        currentRoutine: Routine,
        fitnessOverview: AiFitnessOverview
    ): Promise<AiRoutineAdjustment> {
        const prompt = `
Eres un entrenador personal profesional. Ajusta una rutina existente usando progreso real del usuario.

IMPORTANTE:
- No empieces desde cero.
- Usa la rutina actual como base.
- Ajusta volumen, intensidad, descanso, seleccion de ejercicios o duracion segun los datos.
- Mantén ejercicios realistas y seguros para el nivel del usuario.
- Respeta lesiones, equipamiento, dias disponibles y minutos por sesion.
- Devuelve JSON ESTRICTO y nada mas fuera del JSON.

Datos del perfil:
- Edad: ${profile.age ?? "desconocida"}
- Género: ${profile.gender ?? "desconocido"}
- Altura (cm): ${profile.heightCm ?? "desconocida"}
- Peso actual del perfil (kg): ${profile.weightKg ?? "desconocido"}
- Nivel de experiencia: ${profile.experienceLevel ?? "desconocido"}
- Objetivo principal (fitness_goal): ${profile.fitnessGoal ?? "desconocido"}
- Días disponibles por semana: ${profile.workoutDaysPerWeek ?? "desconocido"}
- Minutos por sesión: ${profile.minutesPerSession ?? "desconocido"}
- Equipamiento disponible: ${(profile.availableEquipment ?? []).join(", ") || "ninguno"}
- Lesiones o limitaciones: ${(profile.injuries ?? []).join(", ") || "ninguna"}

Rutina actual:
${JSON.stringify(this.toRoutineContext(currentRoutine), null, 2)}

Fitness overview:
${JSON.stringify(fitnessOverview, null, 2)}

Reglas de ajuste:
- Si averageDifficulty >= 4.5, baja volumen o aumenta descanso.
- Si averageDifficulty <= 2.5, sube dificultad de forma progresiva.
- Si adherencePercentage < 60, haz la rutina mas simple o corta.
- Si waistChangeCm baja y el objetivo es lose_fat, mantén la direccion.
- Si weightChangeKg sube y el objetivo es gain_muscle, mantén o progresa cargas/volumen.

FORMATO JSON ESPERADO:

{
  "analysis": {
    "summary": "string",
    "progressStatus": "improving | stable | declining | unknown",
    "fatigueLevel": "low | medium | high",
    "recommendedAdjustment": "reduce_volume | increase_difficulty | simplify_routine | maintain_direction | progress_load | change_focus"
  },
  "routine": {
    "title": "string",
    "description": "string",
    "goal": "lose_fat | gain_muscle | maintenance | recomposition",
    "days": [
      {
        "dayOfWeek": "monday | tuesday | wednesday | thursday | friday | saturday | sunday",
        "focus": "string",
        "exercises": [
          {
            "name": "string",
            "muscleGroup": "string",
            "sets": number,
            "reps": "string",
            "restSeconds": number,
            "equipment": "string",
            "intensity": "low | medium | high",
            "notes": "string opcional"
          }
        ]
      }
    ]
  }
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
            maxTokens: 3000,
            response_format: { type: "json_object" } as any,
        } as any);

        // @ts-ignore
        const rawText = response.message?.content?.[0]?.text ?? "";
        console.log("[CohereRoutineAdapter] Raw adjusted routine from Cohere:", rawText);

        const jsonText = this.extractBalancedJson(rawText);

        let json: AiRoutineAdjustment;
        try {
            json = JSON.parse(jsonText) as AiRoutineAdjustment;
        } catch (error) {
            console.error("[CohereRoutineAdapter] Error parsing adjusted routine JSON:", error);
            console.error("Raw jsonText:", jsonText);
            throw new Error("Failed to parse AI adjusted routine JSON");
        }

        return json;
    }

    private toRoutineContext(routine: Routine) {
        return {
            id: routine.id,
            title: routine.title,
            description: routine.description,
            goal: routine.goal,
            days: (routine.days ?? [])
                .sort((a, b) => a.position - b.position)
                .map((day) => ({
                    dayOfWeek: day.dayOfWeek,
                    position: day.position,
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
