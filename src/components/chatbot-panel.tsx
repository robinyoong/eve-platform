"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CHAT_MODELS,
  CHAT_SUGGESTIONS,
  DEFAULT_CHAT_MODEL,
  type ChatModelId,
} from "@/lib/chatbot";

function messageText(message: {
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (Array.isArray(message.parts) && message.parts.length > 0) {
    return message.parts
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text as string)
      .join("");
  }

  return typeof message.content === "string" ? message.content : "";
}

export function ChatbotPanel() {
  const [model, setModel] = useState<ChatModelId>(DEFAULT_CHAT_MODEL);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    transport,
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    clearError();
    setInput("");
    void sendMessage({ text: trimmed }, { body: { model } });
  }

  return (
    <div className="flex min-h-[min(70vh,720px)] flex-col overflow-hidden rounded-lg border border-border bg-panel">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fg">Ask about eve</p>
          <p className="text-xs text-fg-muted">
            Streaming answers about agents, skills, tools, and more
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Model"
          className="flex flex-wrap gap-1 rounded-md border border-border bg-code-bg p-1"
        >
          {CHAT_MODELS.map((option) => {
            const active = option.id === model;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setModel(option.id)}
                className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-btn text-btn-fg"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length === 0 ? (
          <div className="animate-fade-up space-y-4">
            <p className="text-sm leading-6 text-fg-muted">
              Ask anything about building agents with eve. Pick a model above,
              then try a starter question:
            </p>
            <div className="flex flex-wrap gap-2">
              {CHAT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submit(suggestion)}
                  className="rounded-md border border-border bg-code-bg px-3 py-2 text-left text-sm text-fg transition-colors hover:border-fg/40 hover:text-fg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`animate-fade-cross flex ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[min(100%,36rem)] rounded-lg px-3.5 py-2.5 text-sm leading-6 ${
                    isUser
                      ? "bg-btn text-btn-fg"
                      : "border border-border bg-code-bg text-fg"
                  }`}
                >
                  {!isUser && (
                    <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-fg-muted">
                      {CHAT_MODELS.find((m) => m.id === model)?.label ?? "eve"}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{messageText(message)}</p>
                </div>
              </div>
            );
          })
        )}

        {status === "submitted" && (
          <p className="font-mono text-xs text-fg-muted">Thinking…</p>
        )}
        {status === "streaming" && (
          <p className="font-mono text-xs text-fg-muted">Streaming…</p>
        )}
        {error && (
          <p className="rounded-md border border-border bg-code-bg px-3 py-2 text-sm text-fg-muted">
            Something went wrong. {error.message}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Ask about eve…"
            disabled={isBusy}
            className="min-w-0 flex-1 rounded-md border border-border bg-code-bg px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-fg/50 disabled:opacity-60"
            aria-label="Message"
          />
          {isBusy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="rounded-md border border-border px-4 text-sm font-medium text-fg transition-colors hover:bg-code-bg"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-md bg-btn px-4 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
