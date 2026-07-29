"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState, useEffectEvent } from "react";
import {
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL,
  type ChatModelId,
} from "@/lib/chat-models";

const SUGGESTIONS = [
  "What is eve?",
  "How do I add a tool?",
  "What goes in skills/?",
] as const;

function messageText(parts: { type: string; text?: string }[]) {
  return parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
}

export function EveChatbot() {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ChatModelId>(DEFAULT_CHAT_MODEL);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    onError: (err) => {
      setError(err.message || "Something went wrong. Try again.");
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  const scrollToBottom = useEffectEvent(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  async function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    setError(null);
    setInput("");
    await sendMessage({ text: trimmed }, { body: { model } });
  }

  return (
    <section id="chat" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-wide text-fg-muted uppercase">
            Ask eve
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Questions about the framework
          </h2>
          <p className="mt-4 text-base leading-7 text-fg-muted">
            Stream answers about instructions, skills, tools, sandboxes, and
            channels. Switch models anytime.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-lg border border-border bg-panel">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-fg-muted">Model</p>
            <div
              role="radiogroup"
              aria-label="Chat model"
              className="grid grid-cols-3 gap-1 rounded-md border border-border bg-code-bg p-1"
            >
              {CHAT_MODELS.map((option) => {
                const selected = model === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setModel(option.id)}
                    className={`rounded px-2.5 py-1.5 text-center text-xs transition-colors sm:text-sm ${
                      selected
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

          <div className="flex h-[min(28rem,60vh)] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="animate-fade-up flex h-full flex-col justify-center gap-4">
                  <p className="text-sm leading-6 text-fg-muted">
                    Ask how eve structures agents, or try a starter question.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => void submit(suggestion)}
                        className="rounded-md border border-border bg-code-bg px-3 py-1.5 text-left text-sm text-fg transition-colors hover:border-fg-muted/50 hover:bg-bg"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const text = messageText(message.parts);
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={`animate-fade-up flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[min(100%,36rem)] rounded-lg px-3.5 py-2.5 text-sm leading-6 whitespace-pre-wrap ${
                          isUser
                            ? "bg-btn text-btn-fg"
                            : "border border-border bg-code-bg text-fg"
                        }`}
                      >
                        {!isUser && (
                          <p className="mb-1.5 font-mono text-[11px] tracking-wide text-fg-muted uppercase">
                            eve
                          </p>
                        )}
                        {text ||
                          (isStreaming && !isUser ? (
                            <span
                              className="inline-flex gap-1 text-fg-muted"
                              aria-label="Thinking"
                            >
                              <span className="chat-dot" />
                              <span className="chat-dot animation-delay-150" />
                              <span className="chat-dot animation-delay-300" />
                            </span>
                          ) : null)}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {error ? (
              <p className="border-t border-border px-4 py-2 text-sm text-red-400">
                {error}
              </p>
            ) : null}

            <form
              className="flex items-end gap-2 border-t border-border p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void submit(input);
              }}
            >
              <label className="sr-only" htmlFor="eve-chat-input">
                Ask a question about eve
              </label>
              <textarea
                id="eve-chat-input"
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submit(input);
                  }
                }}
                placeholder="Ask about eve…"
                disabled={isStreaming}
                className="max-h-32 min-h-10 flex-1 resize-none rounded-md border border-border bg-code-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-fg-muted/60 focus:outline-none disabled:opacity-60"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-border px-4 text-sm text-fg transition-colors hover:bg-code-bg"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-btn px-4 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Send
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
