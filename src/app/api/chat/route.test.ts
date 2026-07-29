import { beforeEach, describe, expect, it, vi } from "vitest";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import type { LanguageModelV4StreamPart } from "@ai-sdk/provider";
import type { ChatModel } from "@/lib/chat-models";

const gatewayConfigured = vi.fn(() => true);
const resolvedModels: ChatModel[] = [];
let model: MockLanguageModelV4;

vi.mock("@/lib/gateway", () => ({
  isGatewayConfigured: () => gatewayConfigured(),
  resolveLanguageModel: (chatModel: ChatModel) => {
    resolvedModels.push(chatModel);
    return model;
  },
}));

const { POST } = await import("@/app/api/chat/route");

const USAGE = {
  inputTokens: {
    total: 12,
    noCache: 12,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 8, text: 8, reasoning: undefined },
};

function streamingModel(deltas: string[]) {
  const chunks: LanguageModelV4StreamPart[] = [
    { type: "stream-start", warnings: [] },
    { type: "text-start", id: "0" },
    ...deltas.map((delta) => ({ type: "text-delta" as const, id: "0", delta })),
    { type: "text-end", id: "0" },
    {
      type: "finish",
      finishReason: { unified: "stop", raw: "stop" },
      usage: USAGE,
    },
  ];

  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({ chunkDelayInMs: 0, chunks }),
    }),
  });
}

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

function userMessage(text: string) {
  return {
    id: "m1",
    role: "user" as const,
    parts: [{ type: "text" as const, text }],
  };
}

beforeEach(() => {
  gatewayConfigured.mockReturnValue(true);
  resolvedModels.length = 0;
  model = streamingModel(["An agent ", "is a directory."]);
});

describe("POST /api/chat", () => {
  it("streams the answer back as a UI message stream", async () => {
    const response = await post({
      modelId: "grok-4.5",
      messages: [userMessage("What is eve?")],
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");

    const body = await response.text();
    const chunks = body
      .split("\n")
      .filter((line) => line.startsWith("data: "))
      .map((line) => line.slice("data: ".length))
      .filter((data) => data !== "[DONE]")
      .map((data) => JSON.parse(data));

    expect(chunks.filter((chunk) => chunk.type === "text-delta")).toHaveLength(2);
    expect(
      chunks
        .filter((chunk) => chunk.type === "text-delta")
        .map((chunk) => chunk.delta)
        .join(""),
    ).toBe("An agent is a directory.");
    expect(chunks.at(-1)?.type).toBe("finish");
  });

  it("tags the stream with the model that answered", async () => {
    const response = await post({
      modelId: "claude-opus-5",
      messages: [userMessage("What are skills for?")],
    });

    const body = await response.text();
    expect(body).toContain('"modelId":"claude-opus-5"');
    expect(body).toContain('"modelLabel":"Claude Opus 5"');
  });

  it("resolves the gateway slug for the requested model", async () => {
    const response = await post({
      modelId: "gpt-5.6",
      messages: [userMessage("How do schedules work?")],
    });
    await response.text();

    expect(resolvedModels).toHaveLength(1);
    expect(resolvedModels[0]?.gatewayModelId).toBe("openai/gpt-5.6-sol");
  });

  it("grounds the model in the eve reference material", async () => {
    const response = await post({
      modelId: "grok-4.5",
      messages: [userMessage("How do I add a tool?")],
    });
    await response.text();

    const call = model.doStreamCalls[0];
    const system = call.prompt.find((message) => message.role === "system");
    const instructions = typeof system?.content === "string" ? system.content : "";

    expect(instructions).toContain("npx eve@latest init my-agent");
    expect(instructions).toContain("agent/tools/");
    expect(instructions).toContain("https://vercel.com/docs/eve");
    expect(call.prompt.at(-1)?.role).toBe("user");
  });

  it("rejects a model id that is not in the catalog", async () => {
    for (const modelId of [undefined, "gpt-4", "openai/gpt-5.6-sol"]) {
      const response = await post({ modelId, messages: [userMessage("hi")] });
      expect(response.status).toBe(400);
      expect(resolvedModels).toHaveLength(0);
    }
  });

  it("rejects malformed messages", async () => {
    const response = await post({
      modelId: "grok-4.5",
      messages: [{ role: "user", parts: "not-an-array" }],
    });

    expect(response.status).toBe(400);
    expect(resolvedModels).toHaveLength(0);
  });

  it("rejects a body that is not JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("reports 503 when the gateway credential is missing", async () => {
    gatewayConfigured.mockReturnValue(false);

    const response = await post({
      modelId: "grok-4.5",
      messages: [userMessage("What is eve?")],
    });

    expect(response.status).toBe(503);
    expect(resolvedModels).toHaveLength(0);
  });
});
