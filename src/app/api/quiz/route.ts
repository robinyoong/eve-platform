import {
  QUIZ_QUESTIONS,
  getScoreLabel,
  scoreQuiz,
} from "@/lib/quiz";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 32_768;
const OPTION_IDS = new Set(["a", "b", "c", "d"]);
const QUESTION_IDS = new Set(QUIZ_QUESTIONS.map((q) => q.id));

function json(data: unknown, status = 200, init?: ResponseInit) {
  return Response.json(data, {
    status,
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });
}

/**
 * Public question bank — never includes correctOptionId or explanation.
 */
export function GET() {
  return json({
    ok: true,
    count: QUIZ_QUESTIONS.length,
    questions: QUIZ_QUESTIONS.map(({ id, prompt, options }) => ({
      id,
      prompt,
      options,
    })),
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ error: "invalid_content_type" }, 415);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: "payload_too_large" }, 413);
  }
  if (!raw.trim()) {
    return json({ error: "empty_body" }, 400);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "invalid_body" }, 400);
  }

  const { answers } = body as { answers?: unknown };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return json({ error: "invalid_answers" }, 400);
  }

  const record = answers as Record<string, unknown>;
  const keys = Object.keys(record);

  if (keys.length === 0) {
    return json({ error: "empty_answers" }, 400);
  }

  for (const key of keys) {
    if (!QUESTION_IDS.has(key)) {
      return json({ error: "unknown_question", questionId: key }, 400);
    }
    const value = record[key];
    if (typeof value !== "string" || !OPTION_IDS.has(value)) {
      return json({ error: "invalid_option", questionId: key }, 400);
    }
  }

  const normalized: Record<string, string> = {};
  for (const key of keys) {
    normalized[key] = record[key] as string;
  }

  const scored = scoreQuiz(normalized);
  return json(
    {
      ok: true,
      correct: scored.correct,
      total: scored.total,
      percentage: scored.percentage,
      label: getScoreLabel(scored.percentage),
      answered: keys.length,
      complete: keys.length === QUIZ_QUESTIONS.length,
      results: scored.results.map(
        ({ question, selectedOptionId, isCorrect }) => ({
          questionId: question.id,
          selectedOptionId,
          isCorrect,
          correctOptionId: question.correctOptionId,
          explanation: question.explanation,
        }),
      ),
    },
    200,
  );
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}
