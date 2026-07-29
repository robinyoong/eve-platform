export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "minimum-agent",
    prompt:
      "You scaffold a fresh agent with `npx eve@latest init`. Which file alone is enough for eve to run a working agent?",
    options: [
      { id: "a", label: "agent/agent.ts" },
      { id: "b", label: "agent/instructions.md" },
      { id: "c", label: "agent/tools/get_weather.ts" },
      { id: "d", label: "agent/skills/research.md" },
    ],
    correctOptionId: "b",
    explanation:
      "instructions.md is a complete agent on its own. agent.ts, tools, and skills are optional layers you add when you need them.",
  },
  {
    id: "tool-registration",
    prompt:
      "You add `agent/tools/fetch_stock_price.ts` with a valid `defineTool` export. What must you do before the model can call it?",
    options: [
      { id: "a", label: "Register it in agent.ts under a tools array" },
      { id: "b", label: "Import it from instructions.md frontmatter" },
      { id: "c", label: "Nothing — eve discovers it from the filename" },
      { id: "d", label: "Add a matching entry in skills/ with the same name" },
    ],
    correctOptionId: "c",
    explanation:
      "Tools in tools/ are auto-discovered. The filename becomes the tool name; there is no manual registration step.",
  },
  {
    id: "skills-loading",
    prompt:
      "When does eve load the contents of a skill file from skills/?",
    options: [
      { id: "a", label: "On every model turn, appended to the system prompt" },
      { id: "b", label: "Only when the skill is judged relevant to the task" },
      { id: "c", label: "Once at startup, then cached for the session" },
      { id: "d", label: "Only when referenced by name in instructions.md" },
    ],
    correctOptionId: "b",
    explanation:
      "Skills are Markdown playbooks loaded when relevant, so the agent gets focused guidance without carrying every skill in every prompt.",
  },
  {
    id: "schedule-format",
    prompt:
      "You want an agent to send a daily digest at 08:00 UTC. Where and how do you define that schedule?",
    options: [
      { id: "a", label: "cron field in agent.ts next to the model config" },
      { id: "b", label: "A schedules/*.md file with cron in YAML frontmatter" },
      { id: "c", label: "A channel file under channels/ with a cron export" },
      { id: "d", label: "An environment variable EVE_CRON on deploy" },
    ],
    correctOptionId: "b",
    explanation:
      "Schedules are Markdown files (e.g. schedules/daily-digest.md) with a cron expression in frontmatter, like `cron: \"0 8 * * *\"`.",
  },
  {
    id: "agent-ts-purpose",
    prompt:
      "Your project has instructions.md but no agent.ts. You add agent.ts. What is its primary role?",
    options: [
      { id: "a", label: "Required entry point — eve cannot boot without it" },
      { id: "b", label: "Choose model and configure the runtime" },
      { id: "c", label: "List which tools and skills are enabled" },
      { id: "d", label: "Define Slack and Discord webhook URLs" },
    ],
    correctOptionId: "b",
    explanation:
      "eve ships with a default model. agent.ts is optional and used when you want to pick a model or tune runtime settings.",
  },
  {
    id: "sandbox-default",
    prompt:
      "A new agent has no sandbox/sandbox.ts file. What is true about its sandbox?",
    options: [
      { id: "a", label: "File and bash tools are unavailable until you add one" },
      { id: "b", label: "It runs on your local machine during `eve dev` only" },
      {
        id: "c",
        label: "An isolated sandbox with file tools is already included",
      },
      { id: "d", label: "Sandbox features require a Vercel Pro subscription" },
    ],
    correctOptionId: "c",
    explanation:
      "Every agent includes an isolated sandbox and file tools by default. sandbox/sandbox.ts only customizes backend or setup.",
  },
  {
    id: "tool-name",
    prompt:
      "The file is `agent/tools/get_weather.ts`. What name does the model use when calling this tool?",
    options: [
      { id: "a", label: "get_weather" },
      { id: "b", label: "getWeather" },
      { id: "c", label: "get-weather" },
      { id: "d", label: "Whatever string is in defineTool({ name: ... })" },
    ],
    correctOptionId: "a",
    explanation:
      "The filename (without extension) becomes the tool name. defineTool does not take a separate name field in the eve pattern shown here.",
  },
  {
    id: "channels-vs-schedules",
    prompt:
      "Which statement best distinguishes channels/ from schedules/?",
    options: [
      {
        id: "a",
        label: "Channels are TypeScript; schedules are always Markdown",
      },
      {
        id: "b",
        label: "Channels react to user messages; schedules run on a timer",
      },
      {
        id: "c",
        label: "Channels require Connect; schedules use the AI Gateway only",
      },
      {
        id: "d",
        label: "Channels deploy separately; schedules share the dev server",
      },
    ],
    correctOptionId: "b",
    explanation:
      "Channel files wire the same agent into Slack, Discord, Teams, or the web. Schedules trigger the agent automatically on a cron.",
  },
  {
    id: "durable-primitive",
    prompt:
      "A long-running agent step fails mid-flight after a network blip. Which eve primitive is designed to checkpoint and resume that work?",
    options: [
      { id: "a", label: "AI Gateway" },
      { id: "b", label: "Connect" },
      { id: "c", label: "Workflows" },
      { id: "d", label: "Sandbox" },
    ],
    correctOptionId: "c",
    explanation:
      "Workflows provide durable execution with checkpointed steps that resume on redelivery. Gateway handles model calls; Sandbox is for isolated execution.",
  },
  {
    id: "slack-credentials",
    prompt:
      "In channels/slack.ts you see `connectSlackCredentials(\"slack/my-agent\")`. What does that string refer to?",
    options: [
      { id: "a", label: "A path to a local .env key file" },
      { id: "b", label: "A Slack workspace channel ID" },
      { id: "c", label: "A Connect credential store reference" },
      { id: "d", label: "The agent directory name on disk" },
    ],
    correctOptionId: "c",
    explanation:
      "Connect manages auth for third-party services. The string is a credential reference in Connect, not a filesystem path or Slack channel ID.",
  },
];

export function scoreQuiz(answers: Record<string, string>): {
  correct: number;
  total: number;
  percentage: number;
  results: Array<{
    question: QuizQuestion;
    selectedOptionId: string | undefined;
    isCorrect: boolean;
  }>;
} {
  const results = QUIZ_QUESTIONS.map((question) => {
    const selectedOptionId = answers[question.id];
    const isCorrect = selectedOptionId === question.correctOptionId;
    return { question, selectedOptionId, isCorrect };
  });

  const correct = results.filter((result) => result.isCorrect).length;
  const total = QUIZ_QUESTIONS.length;
  const percentage = Math.round((correct / total) * 100);

  return { correct, total, percentage, results };
}

export function getScoreLabel(percentage: number): string {
  if (percentage === 100) return "Perfect — you know eve cold.";
  if (percentage >= 80) return "Strong grasp of the agent directory model.";
  if (percentage >= 60) return "Solid start; re-read the tricky bits below.";
  if (percentage >= 40) return "Some concepts mixed up — the explanations will help.";
  return "Time to walk through the tutorial again.";
}
