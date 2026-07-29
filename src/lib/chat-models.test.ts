import { describe, expect, it } from "vitest";
import {
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL,
  findChatModel,
} from "@/lib/chat-models";

describe("chat model catalog", () => {
  it("exposes the three required models", () => {
    expect(CHAT_MODELS.map((model) => model.label)).toEqual([
      "Grok 4.5",
      "Claude Opus 5",
      "ChatGPT-5.6",
    ]);
  });

  it("maps catalog ids to gateway slugs", () => {
    expect(findChatModel("grok-4.5")?.gatewayModelId).toBe("xai/grok-4.5");
    expect(findChatModel("claude-opus-5")?.gatewayModelId).toBe(
      "anthropic/claude-opus-5",
    );
    expect(findChatModel("gpt-5.6")?.gatewayModelId).toBe(
      "openai/gpt-5.6-sol",
    );
  });

  it("rejects unknown ids and raw gateway slugs", () => {
    expect(findChatModel(undefined)).toBeUndefined();
    expect(findChatModel("gpt-4")).toBeUndefined();
    expect(findChatModel("openai/gpt-5.6-sol")).toBeUndefined();
    expect(findChatModel(DEFAULT_CHAT_MODEL.id)).toEqual(DEFAULT_CHAT_MODEL);
  });
});
