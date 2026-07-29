import { AGENT_TREE, INIT_COMMAND, PRIMITIVES, TUTORIAL_STEPS } from "@/lib/tutorial";

type TreeEntry = {
  name: string;
  kind: "dir" | "file";
  children?: readonly TreeEntry[];
};

function renderTree(entries: readonly TreeEntry[], indent = ""): string[] {
  return entries.flatMap((entry, index) => {
    const isLast = index === entries.length - 1;
    const branch = indent === "" ? "" : `${isLast ? "└── " : "├── "}`;
    const childIndent = indent === "" ? "  " : `${indent}${isLast ? "    " : "│   "}`;

    return [
      `${indent}${branch}${entry.name}`,
      ...(entry.children ? renderTree(entry.children, childIndent) : []),
    ];
  });
}

const OVERVIEW = `eve is Vercel's agent framework. The tagline used on this site is "like Next.js for
web apps, but for agents": Markdown for instructions and skills, TypeScript for tools, durable
by default.

The core mental model is that an agent is a directory. Files in that directory are discovered by
convention, so there is no registration step and no central config object.

Scaffold a new agent with \`${INIT_COMMAND}\`, then run \`eve dev\` to start it locally (it reports
"agent ready on :3000").

Official links:
- Docs: https://vercel.com/docs/eve
- Product page: https://vercel.com/eve
- Source: https://github.com/vercel/eve`;

const DIRECTORY_LAYOUT = `A typical agent directory looks like this:

${renderTree(AGENT_TREE).join("\n")}`;

const TUTORIAL = TUTORIAL_STEPS.map((step, index) => {
  const samples = step.tabs
    .map((tab) => `Example \`${tab.label}\`:\n\`\`\`${tab.language}\n${tab.code}\n\`\`\``)
    .join("\n\n");

  return `### Step ${index + 1}: ${step.title} (\`${step.path}\`)
${step.description}

${samples}`;
}).join("\n\n");

const PLATFORM = PRIMITIVES.map(
  (primitive) => `- ${primitive.name}: ${primitive.description}`,
).join("\n");

/**
 * Grounding document for the chatbot, generated from the same content the page
 * renders so answers cannot drift from the tutorial.
 */
export const EVE_KNOWLEDGE = `## What eve is

${OVERVIEW}

## Directory layout

${DIRECTORY_LAYOUT}

## Tutorial

${TUTORIAL}

## Vercel primitives eve builds on

${PLATFORM}`;

export const EVE_CHAT_INSTRUCTIONS = `You are the assistant embedded in the "Learn eve" tutorial site. You answer questions about
eve, Vercel's agent framework.

Answer only from the reference material below. If it does not cover the question, say so plainly
and point the reader at https://vercel.com/docs/eve instead of guessing — never invent APIs,
file names, CLI flags, or configuration options. If a question is unrelated to eve or to building
agents, say that is outside what you can help with here.

Style:
- Be concise and concrete. Two or three short paragraphs at most, or a short list.
- Lead with the answer, then the detail.
- Use fenced code blocks for code, and keep snippets faithful to the reference material.
- Refer to the framework as "eve", lowercase.

# Reference material

${EVE_KNOWLEDGE}`;

export const SUGGESTED_QUESTIONS = [
  "What is eve?",
  "How do I add a tool?",
  "What are skills for?",
  "How do schedules work?",
] as const;
