export type MessageSegment =
  | { type: "text"; text: string }
  | { type: "code"; language: string | undefined; code: string };

const FENCE = /^\s*```(\S*)\s*$/;

/**
 * Splits assistant text into prose and fenced code segments. A fence that has
 * not been closed yet is still returned as code so blocks render correctly
 * while the response is streaming in.
 */
export function splitCodeFences(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let buffer: string[] = [];
  let language: string | undefined;
  let inCode = false;

  const flush = () => {
    const content = buffer.join("\n");
    buffer = [];

    if (inCode) {
      segments.push({ type: "code", language, code: content });
      return;
    }

    if (content.trim() !== "") {
      segments.push({ type: "text", text: content.replace(/^\n+|\n+$/g, "") });
    }
  };

  for (const line of text.split("\n")) {
    const fence = FENCE.exec(line);
    if (!fence) {
      buffer.push(line);
      continue;
    }

    flush();

    if (inCode) {
      inCode = false;
      language = undefined;
    } else {
      inCode = true;
      language = fence[1] === "" ? undefined : fence[1];
    }
  }

  flush();
  return segments;
}
