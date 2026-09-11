import { createOpenAI } from "@ai-sdk/openai";

/** Lovable AI Gateway provider (OpenAI Responses API path). */
export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAI({
    apiKey: lovableApiKey,
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}
