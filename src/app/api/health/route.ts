const SERVICE = "eve-platform";
const VERSION = "0.1.0";

const STARTED_AT = Date.now();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const verbose = url.searchParams.get("verbose");

  if (verbose !== null && verbose !== "0" && verbose !== "1" && verbose !== "true" && verbose !== "false") {
    return Response.json(
      {
        ok: false,
        error: "invalid_verbose",
        message: 'Query param "verbose" must be 0, 1, true, or false.',
      },
      { status: 400 },
    );
  }

  const includeDetails = verbose === "1" || verbose === "true";

  const body: Record<string, unknown> = {
    ok: true,
    service: SERVICE,
    version: VERSION,
    timestamp: new Date().toISOString(),
  };

  if (includeDetails) {
    body.uptimeMs = Date.now() - STARTED_AT;
    body.node = process.version;
  }

  return Response.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, HEAD, OPTIONS",
    },
  });
}
