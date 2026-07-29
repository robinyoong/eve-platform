import { TUTORIAL_STEPS } from "@/lib/tutorial";

const MAX_BODY_BYTES = 8_192;
const ALLOWED_RATINGS = new Set([1, 2, 3, 4, 5]);

function summarizeStep(step: (typeof TUTORIAL_STEPS)[number]) {
  return {
    id: step.id,
    path: step.path,
    title: step.title,
    description: step.description,
    tabCount: step.tabs.length,
  };
}

function findStep(id: string) {
  return TUTORIAL_STEPS.find((step) => step.id === id);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const includeCode = url.searchParams.get("code");

  if (id !== null) {
    if (id.length === 0 || id.length > 64) {
      return Response.json(
        {
          ok: false,
          error: "invalid_id",
          message: 'Query param "id" must be 1–64 characters.',
        },
        { status: 400 },
      );
    }

    if (!/^[a-z0-9-]+$/i.test(id)) {
      return Response.json(
        {
          ok: false,
          error: "invalid_id",
          message: 'Query param "id" may only contain letters, numbers, and hyphens.',
        },
        { status: 400 },
      );
    }

    const step = findStep(id);
    if (!step) {
      return Response.json(
        {
          ok: false,
          error: "not_found",
          message: `No tutorial step with id "${id}".`,
        },
        { status: 404 },
      );
    }

    const wantCode = includeCode === "1" || includeCode === "true";
    return Response.json(
      {
        ok: true,
        step: wantCode
          ? {
              id: step.id,
              path: step.path,
              title: step.title,
              description: step.description,
              tabs: step.tabs,
            }
          : summarizeStep(step),
      },
      {
        headers: { "Cache-Control": "public, max-age=60" },
      },
    );
  }

  if (includeCode !== null && includeCode !== "0" && includeCode !== "1" && includeCode !== "true" && includeCode !== "false") {
    return Response.json(
      {
        ok: false,
        error: "invalid_code",
        message: 'Query param "code" must be 0, 1, true, or false.',
      },
      { status: 400 },
    );
  }

  const wantCode = includeCode === "1" || includeCode === "true";

  return Response.json(
    {
      ok: true,
      count: TUTORIAL_STEPS.length,
      steps: wantCode
        ? TUTORIAL_STEPS.map((step) => ({
            id: step.id,
            path: step.path,
            title: step.title,
            description: step.description,
            tabs: step.tabs,
          }))
        : TUTORIAL_STEPS.map(summarizeStep),
    },
    {
      headers: { "Cache-Control": "public, max-age=60" },
    },
  );
}

type FeedbackBody = {
  stepId?: unknown;
  rating?: unknown;
  comment?: unknown;
};

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return Response.json(
      {
        ok: false,
        error: "unsupported_media_type",
        message: 'Content-Type must be "application/json".',
      },
      { status: 415 },
    );
  }

  const raw = await request.text();
  if (raw.length === 0) {
    return Response.json(
      {
        ok: false,
        error: "empty_body",
        message: "Request body is required.",
      },
      { status: 400 },
    );
  }

  if (raw.length > MAX_BODY_BYTES) {
    return Response.json(
      {
        ok: false,
        error: "payload_too_large",
        message: `Body exceeds ${MAX_BODY_BYTES} bytes.`,
      },
      { status: 413 },
    );
  }

  let body: FeedbackBody;
  try {
    body = JSON.parse(raw) as FeedbackBody;
  } catch {
    return Response.json(
      {
        ok: false,
        error: "invalid_json",
        message: "Body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      {
        ok: false,
        error: "invalid_shape",
        message: "Body must be a JSON object.",
      },
      { status: 400 },
    );
  }

  const { stepId, rating, comment } = body;

  if (typeof stepId !== "string" || !findStep(stepId)) {
    return Response.json(
      {
        ok: false,
        error: "invalid_step_id",
        message: "stepId must match an existing tutorial step.",
      },
      { status: 400 },
    );
  }

  if (typeof rating !== "number" || !Number.isInteger(rating) || !ALLOWED_RATINGS.has(rating)) {
    return Response.json(
      {
        ok: false,
        error: "invalid_rating",
        message: "rating must be an integer from 1 to 5.",
      },
      { status: 400 },
    );
  }

  if (comment !== undefined) {
    if (typeof comment !== "string") {
      return Response.json(
        {
          ok: false,
          error: "invalid_comment",
          message: "comment must be a string when provided.",
        },
        { status: 400 },
      );
    }
    if (comment.length > 500) {
      return Response.json(
        {
          ok: false,
          error: "invalid_comment",
          message: "comment must be at most 500 characters.",
        },
        { status: 400 },
      );
    }
  }

  return Response.json(
    {
      ok: true,
      accepted: true,
      feedback: {
        stepId,
        rating,
        comment: comment ?? null,
        receivedAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
    },
  });
}
