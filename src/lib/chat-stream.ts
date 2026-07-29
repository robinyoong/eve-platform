import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type LanguageModel,
  type ToolSet,
  type UIMessage,
} from "ai";
import { EVE_CHAT_INSTRUCTIONS } from "@/lib/eve-knowledge";

export type EveChatMetadata = {
  /** Id of the model that produced the answer, from the chat model catalog. */
  modelId: string;
  modelLabel: string;
};

export type EveChatMessage = UIMessage<EveChatMetadata>;

type CreateEveChatResponseOptions = {
  messages: EveChatMessage[];
  model: LanguageModel;
  metadata: EveChatMetadata;
  abortSignal?: AbortSignal;
};

export async function createEveChatResponse({
  messages,
  model,
  metadata,
  abortSignal,
}: CreateEveChatResponseOptions): Promise<Response> {
  const result = streamText({
    model,
    instructions: EVE_CHAT_INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    ...(abortSignal ? { abortSignal } : {}),
    onError: ({ error }) => {
      console.error("[api/chat] model stream failed", error);
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream<ToolSet, EveChatMessage>({
      stream: result.stream,
      messageMetadata: ({ part }) =>
        part.type === "start" ? metadata : undefined,
    }),
  });
}
