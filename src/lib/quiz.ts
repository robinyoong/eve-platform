export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "minimum-agent",
    question:
      "What is the minimum filesystem requirement to run a functional Eve agent?",
    options: [
      "agent/agent.ts exporting defineAgent",
      "agent/instructions.md alone",
      "instructions.md plus at least one file in tools/",
      "The full agent/ tree including sandbox/ and channels/",
    ],
    correctIndex: 1,
    explanation:
      "The tutorial states that an instructions.md file is a complete agent — describe its role in Markdown, then run eve. agent.ts, tools, and other directories are optional layers.",
  },
  {
    id: "tool-naming",
    question:
      "You add agent/tools/fetch_stock_price.ts with a default defineTool export. What name does the model use to call it?",
    options: [
      "The camelCase export name (fetchStockPrice)",
      "The description string passed to defineTool",
      "The filename without extension (fetch_stock_price)",
      "Whatever alias you register in agent.ts",
    ],
    correctIndex: 2,
    explanation:
      "Eve derives the tool name from the filename — no registration step. A file named get_weather.ts becomes the get_weather tool automatically.",
  },
  {
    id: "define-tool-import",
    question: "Where must defineTool be imported from in a tools/ file?",
    options: [
      'import { defineTool } from "eve"',
      'import { defineTool } from "eve/tools"',
      'import { defineTool } from "@vercel/eve"',
      'import { tool } from "eve/runtime"',
    ],
    correctIndex: 1,
    explanation:
      'Tools use defineTool from the "eve/tools" entry point, separate from defineAgent which comes from "eve".',
  },
  {
    id: "agent-ts-purpose",
    question: "When is agent/agent.ts actually required?",
    options: [
      "Always — Eve refuses to start without defineAgent",
      "Only when deploying to Vercel production",
      "When you want to choose a model or configure the runtime",
      "Whenever the agent has more than one skill in skills/",
    ],
    correctIndex: 2,
    explanation:
      "Eve ships with a default model. Add agent.ts only when you want to pick a specific model (e.g. openai/gpt-5.4-mini) or tune runtime configuration.",
  },
  {
    id: "skills-loading",
    question:
      "When does Eve load content from agent/skills/ into the agent's context?",
    options: [
      "On every turn, merged into the system prompt",
      "Only after the agent calls an explicit load_skill tool",
      "When the skill is relevant to the current task",
      "Once at startup, before the first user message",
    ],
    correctIndex: 2,
    explanation:
      "Skills are Markdown playbooks loaded when they are relevant — the agent gets focused guidance without carrying every skill in every prompt.",
  },
  {
    id: "skill-frontmatter",
    question:
      "In skills/research.md, which YAML frontmatter field does Eve use to describe the skill?",
    options: ["name", "title", "description", "trigger"],
    correctIndex: 2,
    explanation:
      'The tutorial skill example uses a description field in frontmatter (e.g. description: "Research unfamiliar topics") to characterize when the playbook applies.',
  },
  {
    id: "sandbox-default",
    question: "What does adding agent/sandbox/sandbox.ts actually change?",
    options: [
      "Enables sandbox features that are disabled by default",
      "Chooses a backend or customizes setup — every agent already has a sandbox",
      "Replaces built-in file tools with bash-only execution",
      "Is required before any tool in tools/ can run",
    ],
    correctIndex: 1,
    explanation:
      "Every agent already includes an isolated sandbox and file tools. sandbox/sandbox.ts lets you pick a backend (like vercelSandboxBackend) or customize how the sandbox is set up.",
  },
  {
    id: "sandbox-backend",
    question:
      "In the tutorial sandbox example, which backend and Node runtime are configured?",
    options: [
      "dockerSandboxBackend with node20",
      "vercelSandboxBackend with node24",
      "vercelSandboxBackend with node22",
      "localSandboxBackend with node24",
    ],
    correctIndex: 1,
    explanation:
      'The example imports vercelSandboxBackend from "eve/sandbox" and passes runtime: "node24" to defineSandbox.',
  },
  {
    id: "workflows-primitive",
    question:
      'Which Vercel platform primitive provides "checkpointed steps" and "resume on delivery"?',
    options: ["AI Gateway", "Sandbox", "Workflows", "Connect"],
    correctIndex: 2,
    explanation:
      "Workflows handle durable execution with checkpointed steps that resume on delivery. AI Gateway routes model calls; Sandbox provides isolated VMs; Connect handles third-party auth.",
  },
  {
    id: "schedules-format",
    question: "How are recurring jobs like a daily digest defined in Eve?",
    options: [
      "A cron property in TypeScript files under agent/schedules/",
      "A schedules array in defineAgent inside agent.ts",
      "A cron field in YAML frontmatter of agent/schedules/*.md files",
      "Vercel Cron entries in vercel.json only",
    ],
    correctIndex: 2,
    explanation:
      'Schedules are Markdown files with cron in frontmatter — e.g. cron: "0 8 * * *" in daily-digest.md — that run the agent automatically for jobs like digests.',
  },
];
