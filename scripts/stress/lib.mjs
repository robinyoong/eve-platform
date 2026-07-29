/**
 * Shared stress-test helpers. Every case logs PASS or FAIL.
 */

export function createLogger() {
  const results = [];

  function log(status, name, detail = "") {
    const line = `[${status}] ${name}${detail ? ` — ${detail}` : ""}`;
    console.log(line);
    results.push({ status, name, detail });
  }

  return {
    pass(name, detail) {
      log("PASS", name, detail);
    },
    fail(name, detail) {
      log("FAIL", name, detail);
    },
    summary() {
      const passed = results.filter((r) => r.status === "PASS").length;
      const failed = results.filter((r) => r.status === "FAIL").length;
      console.log("");
      console.log(`=== Summary: ${passed} passed, ${failed} failed, ${results.length} total ===`);
      return { passed, failed, total: results.length, results };
    },
  };
}

export function baseUrl() {
  return (process.env.STRESS_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * @param {string} path
 * @param {RequestInit & { timeoutMs?: number }} [init]
 */
export async function request(path, init = {}) {
  const { timeoutMs = 10_000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      ...rest,
      signal: controller.signal,
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return {
      status: res.status,
      ok: res.ok,
      headers: res.headers,
      text,
      json,
      ms: Date.now() - started,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run cases sequentially so logs stay ordered.
 * @param {{ name: string, run: (log: ReturnType<typeof createLogger>) => Promise<void> }[]} cases
 * @param {ReturnType<typeof createLogger>} log
 */
export async function runCases(cases, log) {
  for (const c of cases) {
    try {
      await c.run(log);
    } catch (err) {
      log.fail(c.name, err instanceof Error ? err.message : String(err));
    }
  }
}

/**
 * Fire N concurrent identical requests; assert all succeed.
 */
export async function storm(path, { concurrency = 50, method = "GET", body, headers } = {}) {
  const jobs = Array.from({ length: concurrency }, () =>
    request(path, {
      method,
      body,
      headers,
      timeoutMs: 30_000,
    }),
  );
  return Promise.all(jobs);
}
