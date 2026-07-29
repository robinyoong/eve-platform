import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import {
  buildDemoReply,
  DEFAULT_CHAT_MODEL,
  EVE_SYSTEM_PROMPT,
  getChatModel,
  isChatModelId,
  type ChatModelId,
} from "@/lib/chatbot";

export const maxDuration = 60;

function hasLiveAiConfig(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.XAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.OPENAI_API_KEY,
  );
}

function forceDemoMode(): boolean {
  const value = process.env.CHATBOT_DEMO_MODE?.toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function resolveModel(modelId: ChatModelId) {
  const config = getChatModel(modelId);

  // Prefer Vercel AI Gateway when configured (string model ids).
  if (process.env.AI_GATEWAY_API_KEY) {
    return config.gatewayModel;
  }

  // Direct provider routing based on selected model + available keys.
  if (config.provider === "xai" && process.env.XAI_API_KEY) {
    return xai(config.providerModel);
  }
  if (config.provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return anthropic(config.providerModel);
  }
  if (config.provider === "openai" && process.env.OPENAI_API_KEY) {
    return openai(config.providerModel);
  }

  // Cross-provider fallbacks if the selected provider key is missing
  // but another key is available.
  if (process.env.XAI_API_KEY) return xai("grok-4.5");
  if (process.env.ANTHROPIC_API_KEY) return anthropic("claude-opus-5");
  if (process.env.OPENAI_API_KEY) return openai("gpt-5.6");

  return config.gatewayModel;
}

type ChatRequestMessage = UIMessage & {
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
};

function extractTextFromMessage(message: ChatRequestMessage): string {
  if (Array.isArray(message.parts) && message.parts.length > 0) {
    return message.parts
      .filter(
        (part): part is { type: "text"; text: string } =>
          part.type === "text" && typeof part.text === "string",
      )
      .map((part) => part.text)
      .join("\n")
      .trim();
  }

  if (typeof message.content === "string") {
    return message.content.trim();
  }

  return "";
}

function extractLastUserText(messages: ChatRequestMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    const text = extractTextFromMessage(message);
    if (text) return text;
  }
  return "";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeDemoChunks(
  writer: { write: (part: UIMessageChunk) => void },
  userText: string,
) {
  const reply = buildDemoReply(userText || "What is eve?");
  const textId = "demo-text";

  writer.write({ type: "text-start", id: textId });

  const chunkSize = 3;
  for (let i = 0; i < reply.length; i += chunkSize) {
    writer.write({
      type: "text-delta",
      id: textId,
      delta: reply.slice(i, i + chunkSize),
    });
    await sleep(12);
  }

  writer.write({ type: "text-end", id: textId });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: UIMessage[];
    model?: unknown;
  };

  const messages = body.messages;
  if (!Array.isArray(messages)) {
    return Response.json(
      { error: "Request body must include a messages array." },
      { status: 400 },
    );
  }

  const modelId = isChatModelId(body.model)
    ? body.model
    : DEFAULT_CHAT_MODEL;
  const userText = extractLastUserText(messages);
  const useDemo = forceDemoMode() || !hasLiveAiConfig();

  const stream = createUIMessageStream({
    async execute({ writer }) {
      if (useDemo) {
        await writeDemoChunks(writer, userText);
        return;
      }

      try {
        const timeoutMs = Number(process.env.CHATBOT_LIVE_TIMEOUT_MS ?? 5000);
        const liveSignal = AbortSignal.any([
          req.signal,
          AbortSignal.timeout(Number.isFinite(timeoutMs) ? timeoutMs : 5000),
        ]);

        const result = streamText({
          model: resolveModel(modelId),
          system: EVE_SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
          abortSignal: liveSignal,
        });

        const uiStream = toUIMessageStream({ stream: result.stream });
        const reader = uiStream.getReader();
        let emittedText = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value.type === "error" && !emittedText) {
            console.error(
              "[chat] live provider error before tokens, falling back to demo:",
              value.errorText,
            );
            await writeDemoChunks(writer, userText);
            return;
          }

          if (value.type === "text-delta") {
            emittedText = true;
          }

          writer.write(value);
        }
      } catch (error) {
        console.error("[chat] live provider failed, falling back to demo:", error);
        await writeDemoChunks(writer, userText);
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}
