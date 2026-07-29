export type ChatModel = {
  /** Stable id used in the request body and in message metadata. */
  id: string;
  label: string;
  vendor: string;
  /** AI Gateway model slug in `creator/model-name` form. */
  gatewayModelId: string;
};

export const CHAT_MODELS: readonly ChatModel[] = [
  {
    id: "grok-4.5",
    label: "Grok 4.5",
    vendor: "xAI",
    gatewayModelId: "xai/grok-4.5",
  },
  {
    id: "claude-opus-5",
    label: "Claude Opus 5",
    vendor: "Anthropic",
    gatewayModelId: "anthropic/claude-opus-5",
  },
  {
    id: "gpt-5.6",
    label: "ChatGPT-5.6",
    vendor: "OpenAI",
    gatewayModelId: "openai/gpt-5.6-sol",
  },
];

export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0];

/**
 * Never pass a client-supplied slug straight to the gateway — only ids from
 * this catalog can reach it.
 */
export function findChatModel(id: unknown): ChatModel | undefined {
  return CHAT_MODELS.find((model) => model.id === id);
}
