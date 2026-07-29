import { createGateway, type LanguageModel } from "ai";
import type { ChatModel } from "@/lib/chat-models";

/**
 * `AI_GATEWAY_BASE_URL` lets the app run against a gateway-compatible proxy
 * (or a stub in environments with no egress to Vercel). Unset means the real
 * AI Gateway.
 */
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
  ...(process.env.AI_GATEWAY_BASE_URL
    ? { baseURL: process.env.AI_GATEWAY_BASE_URL }
    : {}),
});

export function resolveLanguageModel(model: ChatModel): LanguageModel {
  return gateway(model.gatewayModelId);
}

export function isGatewayConfigured(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}
