import { describe, expect, it } from "vitest";
import { splitCodeFences } from "@/lib/code-fences";

describe("splitCodeFences", () => {
  it("returns a single text segment when there is no fence", () => {
    expect(splitCodeFences("An agent is a directory.")).toEqual([
      { type: "text", text: "An agent is a directory." },
    ]);
  });

  it("separates prose from fenced code and keeps the language", () => {
    const text = [
      "Add a tool:",
      "```typescript",
      "export default defineTool({});",
      "```",
      "The filename becomes the tool name.",
    ].join("\n");

    expect(splitCodeFences(text)).toEqual([
      { type: "text", text: "Add a tool:" },
      { type: "code", language: "typescript", code: "export default defineTool({});" },
      { type: "text", text: "The filename becomes the tool name." },
    ]);
  });

  it("treats an unterminated fence as code so streaming output still renders", () => {
    expect(splitCodeFences("Run:\n```bash\nnpx eve@latest init")).toEqual([
      { type: "text", text: "Run:" },
      { type: "code", language: "bash", code: "npx eve@latest init" },
    ]);
  });

  it("omits the language when the fence has no info string", () => {
    expect(splitCodeFences("```\neve dev\n```")).toEqual([
      { type: "code", language: undefined, code: "eve dev" },
    ]);
  });

  it("drops whitespace-only prose between blocks", () => {
    const segments = splitCodeFences("```\na\n```\n\n```\nb\n```");
    expect(segments.map((segment) => segment.type)).toEqual(["code", "code"]);
  });
});
