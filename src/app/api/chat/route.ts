import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { isChatModelId, resolveChatModel } from "@/lib/chat-models";
import { EVE_SYSTEM_PROMPT } from "@/lib/eve-system-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return Response.json(
      { error: "AI_GATEWAY_API_KEY is not configured." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, model: modelParam } = body as {
    messages?: UIMessage[];
    model?: unknown;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: "messages must be a non-empty array." },
      { status: 400 },
    );
  }

  if (modelParam !== undefined && !isChatModelId(modelParam)) {
    return Response.json({ error: "Unsupported model." }, { status: 400 });
  }

  const selected = resolveChatModel(
    typeof modelParam === "string" ? modelParam : undefined,
  );

  const result = streamText({
    model: selected.modelId,
    system: EVE_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
