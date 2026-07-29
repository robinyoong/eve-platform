export const CHAT_MODELS = [
  {
    id: "grok",
    label: "Grok 4.5",
    modelId: "xai/grok-4.5",
  },
  {
    id: "claude",
    label: "Claude Opus 5",
    modelId: "anthropic/claude-opus-5",
  },
  {
    id: "chatgpt",
    label: "ChatGPT-5.6",
    modelId: "openai/gpt-5.6-sol",
  },
] as const;

export type ChatModelId = (typeof CHAT_MODELS)[number]["id"];

export const DEFAULT_CHAT_MODEL: ChatModelId = "grok";

const MODEL_BY_ID = Object.fromEntries(
  CHAT_MODELS.map((model) => [model.id, model]),
) as Record<ChatModelId, (typeof CHAT_MODELS)[number]>;

export function resolveChatModel(model?: string) {
  if (model && model in MODEL_BY_ID) {
    return MODEL_BY_ID[model as ChatModelId];
  }
  return MODEL_BY_ID[DEFAULT_CHAT_MODEL];
}

export function isChatModelId(value: unknown): value is ChatModelId {
  return (
    typeof value === "string" &&
    CHAT_MODELS.some((model) => model.id === value)
  );
}
