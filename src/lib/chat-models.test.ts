import { describe, expect, it } from "vitest";
import { CHAT_MODELS, DEFAULT_CHAT_MODEL, findChatModel } from "@/lib/chat-models";

describe("chat model catalog", () => {
  it("offers Grok 4.5, Claude Opus 5 and ChatGPT-5.6", () => {
    expect(CHAT_MODELS.map((model) => model.label)).toEqual([
      "Grok 4.5",
      "Claude Opus 5",
      "ChatGPT-5.6",
    ]);
  });

  it("maps every model to a gateway slug in creator/model-name form", () => {
    for (const model of CHAT_MODELS) {
      expect(model.gatewayModelId).toMatch(/^[a-z0-9-]+\/[a-z0-9.-]+$/);
    }
  });

  it("uses unique ids and defaults to the first entry", () => {
    const ids = CHAT_MODELS.map((model) => model.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(DEFAULT_CHAT_MODEL).toBe(CHAT_MODELS[0]);
  });

  it("resolves known ids", () => {
    expect(findChatModel("claude-opus-5")?.gatewayModelId).toBe(
      "anthropic/claude-opus-5",
    );
  });

  it("rejects anything that is not a catalog id", () => {
    for (const value of ["anthropic/claude-opus-5", "", undefined, null, 42, {}]) {
      expect(findChatModel(value)).toBeUndefined();
    }
  });
});
