import { splitCodeFences } from "@/lib/code-fences";
import type { EveChatMessage } from "@/lib/chat-stream";

function MessageText({ text }: { text: string }) {
  return (
    <>
      {splitCodeFences(text).map((segment, index) =>
        segment.type === "code" ? (
          <pre
            key={index}
            className="mt-2 overflow-x-auto rounded-md border border-border bg-code-bg p-3 font-mono text-xs leading-5 text-fg"
          >
            <code>{segment.code}</code>
          </pre>
        ) : (
          <p key={index} className="mt-2 whitespace-pre-wrap first:mt-0">
            {segment.text}
          </p>
        ),
      )}
    </>
  );
}

export function ChatMessage({ message }: { message: EveChatMessage }) {
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  if (message.role === "user") {
    return (
      <div className="ml-auto max-w-[85%] rounded-lg bg-code-bg px-3 py-2 text-sm leading-6 text-fg">
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    );
  }

  return (
    <div className="text-sm leading-6 text-fg">
      {message.metadata ? (
        <p className="mb-1.5 font-mono text-[11px] text-fg-muted">
          {message.metadata.modelLabel}
        </p>
      ) : null}
      <MessageText text={text} />
    </div>
  );
}
