import { cohereClient } from "./cohere.client";
import { env } from "@config/env";
import {
    ExperienceLevel,
    FitnessGoal,
    Gender,
    Profile,
} from "@domain/entities/profile.entity";

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