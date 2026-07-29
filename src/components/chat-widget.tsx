"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatModelToggle } from "@/components/chat-model-toggle";
import { ChatMessage } from "@/components/chat-message";
import { DEFAULT_CHAT_MODEL } from "@/lib/chat-models";
import type { EveChatMessage } from "@/lib/chat-stream";
import { SUGGESTED_QUESTIONS } from "@/lib/eve-knowledge";

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [modelId, setModelId] = useState(DEFAULT_CHAT_MODEL.id);
  const [input, setInput] = useState("");

  const { messages, sendMessage, regenerate, stop, status, error, clearError } =
    useChat<EveChatMessage>({ transport });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, status, open]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

  const ask = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed === "" || busy) return;

      clearError();
      setInput("");
      void sendMessage({ text: trimmed }, { body: { modelId } });
    },
    [busy, clearError, modelId, sendMessage],
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-5 bottom-5 z-50 inline-flex h-10 items-center gap-2 rounded-full bg-btn px-4 text-sm font-medium text-btn-fg shadow-lg transition-opacity hover:opacity-90"
      >
        <span aria-hidden className="font-mono">
          ?
        </span>
        Ask about eve
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Ask about eve"
      className="fixed right-5 bottom-5 z-50 flex h-[min(34rem,calc(100dvh-2.5rem))] w-[min(26rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-border bg-panel shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-sm font-medium text-fg">Ask about eve</p>
          <p className="mt-0.5 text-xs text-fg-muted">
            Answers grounded in this tutorial.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="-mr-1 shrink-0 rounded-md px-2 py-1 text-sm text-fg-muted transition-colors hover:text-fg"
        >
          ✕
        </button>
      </div>

      <div className="border-b border-border px-4 py-3">
        <ChatModelToggle value={modelId} onChange={setModelId} disabled={busy} />
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div>
            <p className="text-sm leading-6 text-fg-muted">
              Ask anything about building agents with eve — the directory layout,
              skills, tools, sandboxes, channels, or schedules.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => ask(question)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-fg/30 hover:text-fg"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}

        {status === "submitted" ? (
          <p className="animate-pulse font-mono text-xs text-fg-muted">
            Thinking…
          </p>
        ) : null}

        {error ? (
          <div className="rounded-md border border-border bg-code-bg px-3 py-2 text-xs text-fg-muted">
            Something went wrong.{" "}
            <button
              type="button"
              onClick={() => void regenerate({ body: { modelId } })}
              className="text-fg underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
        className="border-t border-border p-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                ask(input);
              }
            }}
            placeholder="How do I add a tool?"
            aria-label="Message"
            className="max-h-28 min-h-9 flex-1 resize-none rounded-md border border-border bg-code-bg px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-fg/30"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => void stop()}
              className="inline-flex h-9 shrink-0 items-center rounded-md border border-border px-3 text-sm text-fg-muted transition-colors hover:text-fg"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={input.trim() === ""}
              className="inline-flex h-9 shrink-0 items-center rounded-md bg-btn px-3 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
