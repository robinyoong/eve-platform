export type CodeTab = {
  label: string;
  language: "markdown" | "typescript";
  code: string;
};

export type TutorialStep = {
  id: string;
  path: string;
  title: string;
  description: string;
  tabs: CodeTab[];
};

export const INIT_COMMAND = "npx eve@latest init my-agent";

export const AGENT_TREE = [
  {
    name: "agent/",
    kind: "dir" as const,
    children: [
      { name: "instructions.md", kind: "file" as const, highlightId: "instructions" },
      { name: "agent.ts", kind: "file" as const, highlightId: "agent" },
      {
        name: "skills/",
        kind: "dir" as const,
        highlightId: "skills",
        children: [
          { name: "research.md", kind: "file" as const, highlightId: "skills" },
        ],
      },
      {
        name: "tools/",
        kind: "dir" as const,
        highlightId: "tools",
        children: [
          { name: "get_weather.ts", kind: "file" as const, highlightId: "tools" },
        ],
      },
      {
        name: "sandbox/",
        kind: "dir" as const,
        highlightId: "sandbox",
        children: [
          { name: "sandbox.ts", kind: "file" as const, highlightId: "sandbox" },
        ],
      },
      {
        name: "channels/",
        kind: "dir" as const,
        highlightId: "channels",
        children: [
          { name: "slack.ts", kind: "file" as const, highlightId: "channels" },
        ],
      },
      {
        name: "schedules/",
        kind: "dir" as const,
        highlightId: "channels",
        children: [
          { name: "daily-digest.md", kind: "file" as const, highlightId: "channels" },
        ],
      },
    ],
  },
];

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "instructions",
    path: "agent/instructions.md",
    title: "Start with instructions.md",
    description:
      "An instructions.md file is a complete agent. Describe its role in Markdown, then run eve.",
    tabs: [
      {
        label: "instructions.md",
        language: "markdown",
        code: `# Identity

You are an expert weather assistant.
You can fetch the weather for any
city in the world.`,
      },
    ],
  },
  {
    id: "agent",
    path: "agent/agent.ts",
    title: "Choose your model in agent.ts",
    description:
      "eve uses a default model. Add agent.ts when you want to choose a model or configure the runtime.",
    tabs: [
      {
        label: "agent.ts",
        language: "typescript",
        code: `import { defineAgent } from "eve";

export default defineAgent({
  model: "openai/gpt-5.4-mini",
});`,
      },
    ],
  },
  {
    id: "skills",
    path: "agent/skills/",
    title: "Add reusable skills/",
    description:
      "Skills are Markdown playbooks loaded when they are relevant. The agent gets focused guidance without carrying it in every prompt.",
    tabs: [
      {
        label: "research.md",
        language: "markdown",
        code: `---
description: Research unfamiliar topics
---

When the task is novel or ambiguous,
gather evidence first, then answer.`,
      },
    ],
  },
  {
    id: "tools",
    path: "agent/tools/",
    title: "Define tools/ in TypeScript",
    description:
      "Add a TypeScript file to tools/ and the model can call it. The filename becomes the tool name. No registration required.",
    tabs: [
      {
        label: "get_weather.ts",
        language: "typescript",
        code: `import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Get the weather for a city",
  inputSchema: z.object({
    cityName: z.string(),
  }),
  async execute(input) {
    const res = await fetch(
      \`\${process.env.WEATHER_API_URL}/current?city=\${input.cityName}\`
    );
    const data = await res.json();
    return data.current_condition[0];
  },
});`,
      },
    ],
  },
  {
    id: "sandbox",
    path: "agent/sandbox/",
    title: "Customize the sandbox/",
    description:
      "Every agent includes an isolated sandbox and file tools. Add sandbox/sandbox.ts to choose a backend or customize its setup.",
    tabs: [
      {
        label: "sandbox.ts",
        language: "typescript",
        code: `import {
  defineSandbox,
  vercelSandboxBackend,
} from "eve/sandbox";

export default defineSandbox({
  backend: vercelSandboxBackend({
    runtime: "node24",
  }),
});`,
      },
    ],
  },
  {
    id: "channels",
    path: "agent/channels/",
    title: "Connect channels/ and schedules/",
    description:
      "Add channel files to use the same agent in Slack, Discord, Teams, or the web. Schedules run agents automatically for jobs like daily digests.",
    tabs: [
      {
        label: "slack.ts",
        language: "typescript",
        code: `import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

export default slackChannel({
  credentials: connectSlackCredentials("slack/my-agent"),
});`,
      },
      {
        label: "daily-digest.md",
        language: "markdown",
        code: `---
cron: "0 8 * * *"
---

Send the user a daily weather
digest for their saved cities.`,
      },
    ],
  },
];

export const PRIMITIVES = [
  {
    name: "Workflows",
    description: "Durable execution, checkpointed steps, resume on delivery.",
  },
  {
    name: "AI Gateway",
    description: "Model calls and streaming through one unified interface.",
  },
  {
    name: "Sandbox",
    description: "Isolated VMs with filesystem, bash, and code execution.",
  },
  {
    name: "Connect",
    description: "Auth for GitHub, Linear, Stripe, and MCP endpoints.",
  },
] as const;
