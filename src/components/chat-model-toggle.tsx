"use client";

import { CHAT_MODELS } from "@/lib/chat-models";

type ChatModelToggleProps = {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
};

export function ChatModelToggle({ value, onChange, disabled }: ChatModelToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Answering model"
      className="flex gap-1 rounded-lg border border-border bg-code-bg p-1"
    >
      {CHAT_MODELS.map((model) => {
        const selected = model.id === value;

        return (
          <button
            key={model.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            title={`${model.label} — ${model.vendor}`}
            onClick={() => onChange(model.id)}
            className={`flex-1 rounded-md px-2 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              selected
                ? "bg-fg/10 text-fg"
                : "text-fg-muted hover:bg-fg/5 hover:text-fg"
            }`}
          >
            {model.label}
          </button>
        );
      })}
    </div>
  );
}
