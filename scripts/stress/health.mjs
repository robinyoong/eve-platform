#!/usr/bin/env node
/**
 * Stress + edge-case suite for GET/HEAD /api/health
 * Logs every PASS and every FAIL.
 *
 * Usage:
 *   STRESS_BASE_URL=http://localhost:3000 node scripts/stress/health.mjs
 */

import { createLogger, request, runCases, storm } from "./lib.mjs";

const log = createLogger();

const cases = [
  {
    name: "GET /api/health returns ok payload",
    async run(log) {
      const res = await request("/api/health");
      if (res.status !== 200) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      if (!res.json?.ok || res.json.service !== "eve-platform") {
        log.fail(this.name, `unexpected body: ${res.text.slice(0, 200)}`);
        return;
      }
      if (!res.json.timestamp || Number.isNaN(Date.parse(res.json.timestamp))) {
        log.fail(this.name, "missing/invalid timestamp");
        return;
      }
      log.pass(this.name, `${res.ms}ms`);
    },
  },
  {
    name: "GET /api/health?verbose=1 includes uptimeMs",
    async run(log) {
      const res = await request("/api/health?verbose=1");
      if (res.status !== 200 || typeof res.json?.uptimeMs !== "number") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name, `uptimeMs=${res.json.uptimeMs}`);
    },
  },
  {
    name: "GET /api/health?verbose=true includes node version",
    async run(log) {
      const res = await request("/api/health?verbose=true");
      if (res.status !== 200 || typeof res.json?.node !== "string") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name, res.json.node);
    },
  },
  {
    name: "GET /api/health?verbose=0 omits details",
    async run(log) {
      const res = await request("/api/health?verbose=0");
      if (res.status !== 200) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      if ("uptimeMs" in (res.json || {}) || "node" in (res.json || {})) {
        log.fail(this.name, "details leaked when verbose=0");
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/health?verbose=maybe returns 400",
    async run(log) {
      const res = await request("/api/health?verbose=maybe");
      if (res.status !== 400 || res.json?.error !== "invalid_verbose") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/health with duplicate verbose prefers first valid handling",
    async run(log) {
      // URLSearchParams.get returns the first value
      const res = await request("/api/health?verbose=1&verbose=maybe");
      if (res.status !== 200 || typeof res.json?.uptimeMs !== "number") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "HEAD /api/health returns 200 empty body",
    async run(log) {
      const res = await request("/api/health", { method: "HEAD" });
      if (res.status !== 200) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      if (res.text && res.text.length > 0) {
        log.fail(this.name, `unexpected body length ${res.text.length}`);
        return;
      }
      log.pass(this.name, `${res.ms}ms`);
    },
  },
  {
    name: "OPTIONS /api/health advertises Allow",
    async run(log) {
      const res = await request("/api/health", { method: "OPTIONS" });
      if (res.status !== 204 && res.status !== 200) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      const allow = res.headers.get("allow") || "";
      if (!/GET/i.test(allow) || !/HEAD/i.test(allow)) {
        log.fail(this.name, `Allow=${allow}`);
        return;
      }
      log.pass(this.name, `Allow=${allow}`);
    },
  },
  {
    name: "POST /api/health is method-not-allowed",
    async run(log) {
      const res = await request("/api/health", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      if (res.status !== 405) {
        log.fail(this.name, `expected 405 got ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "PUT /api/health is method-not-allowed",
    async run(log) {
      const res = await request("/api/health", { method: "PUT", body: "{}" });
      if (res.status !== 405) {
        log.fail(this.name, `expected 405 got ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "DELETE /api/health is method-not-allowed",
    async run(log) {
      const res = await request("/api/health", { method: "DELETE" });
      if (res.status !== 405) {
        log.fail(this.name, `expected 405 got ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/health ignores unknown query params",
    async run(log) {
      const res = await request("/api/health?foo=bar&x=%00%01");
      if (res.status !== 200 || !res.json?.ok) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/health survives very long query string",
    async run(log) {
      const junk = "a".repeat(8_000);
      const res = await request(`/api/health?noise=${junk}`);
      if (res.status !== 200 && res.status !== 414 && res.status !== 431) {
        log.fail(this.name, `unexpected status ${res.status}`);
        return;
      }
      // 200 is ideal; some proxies reject oversized URIs — both are acceptable.
      log.pass(this.name, `status ${res.status}`);
    },
  },
  {
    name: "GET /api/health Cache-Control is no-store",
    async run(log) {
      const res = await request("/api/health");
      const cc = res.headers.get("cache-control") || "";
      if (!/no-store/i.test(cc)) {
        log.fail(this.name, `Cache-Control=${cc}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "Concurrent storm: 75× GET /api/health",
    async run(log) {
      const results = await storm("/api/health", { concurrency: 75 });
      const bad = results.filter((r) => r.status !== 200 || !r.json?.ok);
      if (bad.length) {
        log.fail(this.name, `${bad.length}/${results.length} failed (first status=${bad[0].status})`);
        return;
      }
      const maxMs = Math.max(...results.map((r) => r.ms));
      const avgMs = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length);
      log.pass(this.name, `avg=${avgMs}ms max=${maxMs}ms`);
    },
  },
  {
    name: "Concurrent storm: 40× HEAD /api/health",
    async run(log) {
      const results = await storm("/api/health", { concurrency: 40, method: "HEAD" });
      const bad = results.filter((r) => r.status !== 200);
      if (bad.length) {
        log.fail(this.name, `${bad.length}/${results.length} failed`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "Mixed concurrent GET+HEAD under load",
    async run(log) {
      const jobs = [
        ...Array.from({ length: 30 }, () => request("/api/health")),
        ...Array.from({ length: 30 }, () => request("/api/health", { method: "HEAD" })),
        ...Array.from({ length: 10 }, () => request("/api/health?verbose=1")),
      ];
      const results = await Promise.all(jobs);
      const bad = results.filter((r) => r.status !== 200);
      if (bad.length) {
        log.fail(this.name, `${bad.length}/${results.length} failed`);
        return;
      }
      log.pass(this.name, `${results.length} ok`);
    },
  },
];

console.log(`Stress testing /api/health against ${process.env.STRESS_BASE_URL || "http://localhost:3000"}`);
console.log("");

await runCases(cases, log);
const { failed } = log.summary();
process.exit(failed > 0 ? 1 : 0);
