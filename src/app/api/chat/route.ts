import { safeValidateUIMessages } from "ai";
import { findChatModel } from "@/lib/chat-models";
import { createEveChatResponse, type EveChatMessage } from "@/lib/chat-stream";
import { isGatewayConfigured, resolveLanguageModel } from "@/lib/gateway";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isGatewayConfigured()) {
    return Response.json(
      {
        error:
          "The chat is not configured. Set AI_GATEWAY_API_KEY to enable it.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const { messages, modelId } = (body ?? {}) as {
    messages?: unknown;
    modelId?: unknown;
  };

  const model = findChatModel(modelId);
  if (!model) {
    return Response.json({ error: "Unknown model." }, { status: 400 });
  }

  const validated = await safeValidateUIMessages<EveChatMessage>({ messages });
  if (!validated.success) {
    return Response.json({ error: "Invalid messages." }, { status: 400 });
  }

  return createEveChatResponse({
    messages: validated.data,
    model: resolveLanguageModel(model),
    metadata: { modelId: model.id, modelLabel: model.label },
    abortSignal: request.signal,
  });
}
