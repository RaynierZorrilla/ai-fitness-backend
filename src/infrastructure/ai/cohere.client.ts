import { CohereClientV2 } from "cohere-ai";
import { env } from "@config/env";

if (!env.cohere.apiKey) {
  // en dev, solo logueamos; en prod podrías lanzar error
  console.warn("[Cohere] COHERE_API_KEY is not set. AI features will fail.");
}

export const cohereClient = new CohereClientV2({
  token: env.cohere.apiKey,
});
