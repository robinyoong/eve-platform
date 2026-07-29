import {
  AGENT_TREE,
  INIT_COMMAND,
  PRIMITIVES,
  TUTORIAL_STEPS,
} from "@/lib/tutorial";

export const CHAT_MODELS = [
  {
    id: "grok-4.5",
    label: "Grok 4.5",
    /** Vercel AI Gateway model id */
    gatewayModel: "xai/grok-4.5",
    /** Direct provider model id when XAI_API_KEY is set */
    provider: "xai" as const,
    providerModel: "grok-4.5",
  },
  {
    id: "claude-opus-5",
    label: "Claude Opus 5",
    gatewayModel: "anthropic/claude-opus-5",
    provider: "anthropic" as const,
    providerModel: "claude-opus-5",
  },
  {
    id: "chatgpt-5.6",
    label: "ChatGPT 5.6",
    gatewayModel: "openai/gpt-5.6",
    provider: "openai" as const,
    providerModel: "gpt-5.6",
  },
] as const;

export type ChatModelId = (typeof CHAT_MODELS)[number]["id"];

export const DEFAULT_CHAT_MODEL: ChatModelId = "grok-4.5";

export function isChatModelId(value: unknown): value is ChatModelId {
  return (
    typeof value === "string" &&
    CHAT_MODELS.some((model) => model.id === value)
  );
}

export function getChatModel(id: ChatModelId = DEFAULT_CHAT_MODEL) {
  return CHAT_MODELS.find((model) => model.id === id) ?? CHAT_MODELS[0];
}

function formatAgentTree(
  nodes: typeof AGENT_TREE,
  indent = 0,
): string {
  return nodes
    .map((node) => {
      const prefix = "  ".repeat(indent);
      const line = `${prefix}- ${node.name}${node.kind === "dir" ? "" : ""}`;
      const children =
        "children" in node && node.children
          ? `\n${formatAgentTree(node.children as typeof AGENT_TREE, indent + 1)}`
          : "";
      return `${line}${children}`;
    })
    .join("\n");
}

function buildKnowledgeBase(): string {
  const steps = TUTORIAL_STEPS.map(
    (step) =>
      `### ${step.title} (\`${step.path}\`)\n${step.description}\n\nExample (\`${step.tabs[0]?.label}\`):\n\`\`\`\n${step.tabs[0]?.code.trim()}\n\`\`\``,
  ).join("\n\n");

  const primitives = PRIMITIVES.map(
    (primitive) => `- **${primitive.name}**: ${primitive.description}`,
  ).join("\n");

  return `## Init command
\`${INIT_COMMAND}\`

## Agent directory layout
${formatAgentTree(AGENT_TREE)}

## Tutorial steps
${steps}

## Vercel primitives eve builds on
${primitives}`;
}

export const EVE_SYSTEM_PROMPT = `You are Eve Guide — a helpful, concise assistant for **eve**, Vercel's agent framework.

Eve is like Next.js for web apps, but for agents: Markdown for instructions and skills, TypeScript for tools. Agents are durable by default.

Use the knowledge base below when answering. Prefer short, practical answers with code snippets when helpful. If something is outside this knowledge, say so briefly and point people to https://vercel.com/docs/eve.

Stay on topic about eve, agents, tools, skills, sandboxes, channels, schedules, and related Vercel primitives.

# Eve knowledge base

${buildKnowledgeBase()}`;

/** Suggested starter prompts shown in the empty chat state. */
export const CHAT_SUGGESTIONS = [
  "What is eve?",
  "How do I create my first agent?",
  "What's the difference between skills and tools?",
  "How do I connect Slack?",
] as const;

/**
 * Build a realistic demo reply from Eve knowledge when live API keys
 * are not configured. Used by the streaming mock path.
 */
export function buildDemoReply(userText: string): string {
  const q = userText.toLowerCase();

  if (/init|create|start|first|scaffold|npx/.test(q)) {
    return `Scaffold an agent with:

\`\`\`bash
${INIT_COMMAND}
\`\`\`

That creates an \`agent/\` directory. The smallest useful agent is just \`agent/instructions.md\` — describe the role in Markdown, then run \`eve\`. Add \`agent.ts\` when you want to pick a model or configure the runtime.`;
  }

  if (/skill/.test(q) && /tool/.test(q)) {
    return `**Skills** are Markdown playbooks under \`agent/skills/\`. Eve loads them when they are relevant, so the agent gets focused guidance without stuffing every prompt.

**Tools** are TypeScript modules under \`agent/tools/\`. The filename becomes the tool name — no registration step. Example: \`get_weather.ts\` exports \`defineTool({ ... })\` and the model can call it.

Use skills for reusable guidance; use tools when the model needs to take actions or fetch data.`;
  }

  if (/skill/.test(q)) {
    const step = TUTORIAL_STEPS.find((s) => s.id === "skills")!;
    return `${step.description}

Example (\`${step.path}research.md\`):

\`\`\`markdown
${step.tabs[0].code.trim()}
\`\`\``;
  }

  if (/tool/.test(q)) {
    const step = TUTORIAL_STEPS.find((s) => s.id === "tools")!;
    return `${step.description}

Example (\`${step.path}get_weather.ts\`):

\`\`\`typescript
${step.tabs[0].code.trim()}
\`\`\``;
  }

  if (/sandbox/.test(q)) {
    const step = TUTORIAL_STEPS.find((s) => s.id === "sandbox")!;
    return `${step.description}

\`\`\`typescript
${step.tabs[0].code.trim()}
\`\`\``;
  }

  if (/slack|discord|teams|channel|schedule|cron|digest/.test(q)) {
    const step = TUTORIAL_STEPS.find((s) => s.id === "channels")!;
    return `${step.description}

Slack channel example:

\`\`\`typescript
${step.tabs[0].code.trim()}
\`\`\`

Schedule example (\`daily-digest.md\`):

\`\`\`markdown
${step.tabs[1]?.code.trim()}
\`\`\``;
  }

  if (/model|agent\.ts|openai|gpt|claude|grok/.test(q)) {
    const step = TUTORIAL_STEPS.find((s) => s.id === "agent")!;
    return `${step.description}

\`\`\`typescript
${step.tabs[0].code.trim()}
\`\`\``;
  }

  if (/instruction|markdown|identity/.test(q)) {
    const step = TUTORIAL_STEPS.find((s) => s.id === "instructions")!;
    return `${step.description}

\`\`\`markdown
${step.tabs[0].code.trim()}
\`\`\``;
  }

  if (/primitive|workflow|gateway|connect|durable/.test(q)) {
    return `Eve builds on these Vercel primitives:

${PRIMITIVES.map((p) => `- **${p.name}** — ${p.description}`).join("\n")}

Together they give you durable execution, unified model access, isolated runtimes, and auth to external systems.`;
  }

  if (/what is eve|about eve|^eve\b|framework/.test(q)) {
    return `**eve** is Vercel's agent framework — like Next.js for web apps, but for agents.

- **Markdown** for \`instructions.md\` and reusable \`skills/\`
- **TypeScript** for \`tools/\`, \`sandbox/\`, and \`channels/\`
- **Durable by default** via Workflows, with AI Gateway, Sandbox, and Connect underneath

Get started:

\`\`\`bash
${INIT_COMMAND}
\`\`\`

Ask me about skills, tools, sandboxes, channels, or schedules for more detail.`;
  }

  return `Eve is Vercel's agent framework: Markdown for instructions and skills, TypeScript for tools — durable by default.

Quick start:

\`\`\`bash
${INIT_COMMAND}
\`\`\`

A typical agent looks like:

\`\`\`
agent/
  instructions.md
  agent.ts
  skills/
  tools/
  sandbox/
  channels/
  schedules/
\`\`\`

Try asking about **skills vs tools**, **sandboxes**, **Slack channels**, or **schedules** — or check the docs at https://vercel.com/docs/eve.

_(Demo mode — set \`AI_GATEWAY_API_KEY\` or a provider key to use a live model.)_`;
}
