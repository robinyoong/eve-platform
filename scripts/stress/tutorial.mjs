#!/usr/bin/env node
/**
 * Stress + edge-case suite for GET/POST /api/tutorial
 * Logs every PASS and every FAIL.
 *
 * Usage:
 *   STRESS_BASE_URL=http://localhost:3000 node scripts/stress/tutorial.mjs
 */

import { createLogger, request, runCases, storm } from "./lib.mjs";

const log = createLogger();

const cases = [
  {
    name: "GET /api/tutorial lists steps without code by default",
    async run(log) {
      const res = await request("/api/tutorial");
      if (res.status !== 200 || !res.json?.ok) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      if (!Array.isArray(res.json.steps) || res.json.steps.length === 0) {
        log.fail(this.name, "empty steps");
        return;
      }
      if (res.json.count !== res.json.steps.length) {
        log.fail(this.name, `count mismatch ${res.json.count} vs ${res.json.steps.length}`);
        return;
      }
      const leaked = res.json.steps.some((s) => "tabs" in s);
      if (leaked) {
        log.fail(this.name, "tabs present without code=1");
        return;
      }
      log.pass(this.name, `${res.json.count} steps, ${res.ms}ms`);
    },
  },
  {
    name: "GET /api/tutorial?code=1 includes tabs",
    async run(log) {
      const res = await request("/api/tutorial?code=1");
      if (res.status !== 200 || !res.json?.steps?.[0]?.tabs) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name, `tabs=${res.json.steps[0].tabs.length}`);
    },
  },
  {
    name: "GET /api/tutorial?code=maybe returns 400",
    async run(log) {
      const res = await request("/api/tutorial?code=maybe");
      if (res.status !== 400 || res.json?.error !== "invalid_code") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/tutorial?id=instructions returns one step",
    async run(log) {
      const res = await request("/api/tutorial?id=instructions");
      if (res.status !== 200 || res.json?.step?.id !== "instructions") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      if ("tabs" in (res.json.step || {})) {
        log.fail(this.name, "tabs leaked without code=1");
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/tutorial?id=instructions&code=true includes tabs",
    async run(log) {
      const res = await request("/api/tutorial?id=instructions&code=true");
      if (res.status !== 200 || !Array.isArray(res.json?.step?.tabs)) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/tutorial?id=does-not-exist returns 404",
    async run(log) {
      const res = await request("/api/tutorial?id=does-not-exist");
      if (res.status !== 404 || res.json?.error !== "not_found") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/tutorial?id= returns 400",
    async run(log) {
      const res = await request("/api/tutorial?id=");
      if (res.status !== 400 || res.json?.error !== "invalid_id") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/tutorial?id=../etc/passwd returns 400",
    async run(log) {
      const res = await request("/api/tutorial?id=../etc/passwd");
      if (res.status !== 400 || res.json?.error !== "invalid_id") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/tutorial?id=with spaces returns 400",
    async run(log) {
      const res = await request("/api/tutorial?id=with%20spaces");
      if (res.status !== 400 || res.json?.error !== "invalid_id") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /api/tutorial?id= oversized returns 400",
    async run(log) {
      const res = await request(`/api/tutorial?id=${"x".repeat(65)}`);
      if (res.status !== 400 || res.json?.error !== "invalid_id") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial accepts valid feedback",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stepId: "agent", rating: 5, comment: "clear" }),
      });
      if (res.status !== 201 || !res.json?.accepted) {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name, `${res.ms}ms`);
    },
  },
  {
    name: "POST /api/tutorial accepts feedback without comment",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stepId: "tools", rating: 1 }),
      });
      if (res.status !== 201 || res.json?.feedback?.comment !== null) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial rejects missing Content-Type",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        body: JSON.stringify({ stepId: "agent", rating: 3 }),
      });
      if (res.status !== 415 || res.json?.error !== "unsupported_media_type") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial rejects empty body",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "",
      });
      if (res.status !== 400 || res.json?.error !== "empty_body") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial rejects malformed JSON",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not-json",
      });
      if (res.status !== 400 || res.json?.error !== "invalid_json") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial rejects JSON array body",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "[]",
      });
      if (res.status !== 400 || res.json?.error !== "invalid_shape") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial rejects unknown stepId",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stepId: "nope", rating: 3 }),
      });
      if (res.status !== 400 || res.json?.error !== "invalid_step_id") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial rejects rating 0",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stepId: "agent", rating: 0 }),
      });
      if (res.status !== 400 || res.json?.error !== "invalid_rating") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial rejects rating 5.5",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stepId: "agent", rating: 5.5 }),
      });
      if (res.status !== 400 || res.json?.error !== "invalid_rating") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial rejects overlong comment",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stepId: "agent", rating: 4, comment: "c".repeat(501) }),
      });
      if (res.status !== 400 || res.json?.error !== "invalid_comment") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial rejects oversized payload",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          stepId: "agent",
          rating: 3,
          padding: "p".repeat(10_000),
        }),
      });
      if (res.status !== 413 || res.json?.error !== "payload_too_large") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/tutorial rejects non-string comment",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stepId: "agent", rating: 3, comment: { n: 1 } }),
      });
      if (res.status !== 400 || res.json?.error !== "invalid_comment") {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "PUT /api/tutorial is method-not-allowed",
    async run(log) {
      const res = await request("/api/tutorial", { method: "PUT", body: "{}" });
      if (res.status !== 405) {
        log.fail(this.name, `expected 405 got ${res.status}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "OPTIONS /api/tutorial advertises Allow",
    async run(log) {
      const res = await request("/api/tutorial", { method: "OPTIONS" });
      if (res.status !== 204 && res.status !== 200) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      const allow = res.headers.get("allow") || "";
      if (!/GET/i.test(allow) || !/POST/i.test(allow)) {
        log.fail(this.name, `Allow=${allow}`);
        return;
      }
      log.pass(this.name, `Allow=${allow}`);
    },
  },
  {
    name: "Unicode comment is accepted",
    async run(log) {
      const res = await request("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ stepId: "sandbox", rating: 5, comment: "とても良い 🚀" }),
      });
      if (res.status !== 201 || res.json?.feedback?.comment !== "とても良い 🚀") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "Concurrent storm: 60× GET /api/tutorial",
    async run(log) {
      const results = await storm("/api/tutorial", { concurrency: 60 });
      const bad = results.filter((r) => r.status !== 200 || !r.json?.ok);
      if (bad.length) {
        log.fail(this.name, `${bad.length}/${results.length} failed (first=${bad[0].status})`);
        return;
      }
      const avgMs = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length);
      log.pass(this.name, `avg=${avgMs}ms`);
    },
  },
  {
    name: "Concurrent storm: 40× valid POST feedback",
    async run(log) {
      const results = await storm("/api/tutorial", {
        concurrency: 40,
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stepId: "channels", rating: 4 }),
      });
      const bad = results.filter((r) => r.status !== 201 || !r.json?.accepted);
      if (bad.length) {
        log.fail(this.name, `${bad.length}/${results.length} failed (first=${bad[0].status})`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "Mixed concurrent valid + invalid POSTs stay isolated",
    async run(log) {
      const jobs = [
        ...Array.from({ length: 20 }, () =>
          request("/api/tutorial", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ stepId: "agent", rating: 2 }),
          }),
        ),
        ...Array.from({ length: 20 }, () =>
          request("/api/tutorial", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: "{broken",
          }),
        ),
      ];
      const results = await Promise.all(jobs);
      const ok = results.filter((r) => r.status === 201).length;
      const badJson = results.filter((r) => r.status === 400 && r.json?.error === "invalid_json").length;
      if (ok !== 20 || badJson !== 20) {
        log.fail(this.name, `ok=${ok} badJson=${badJson}`);
        return;
      }
      log.pass(this.name);
    },
  },
];

console.log(`Stress testing /api/tutorial against ${process.env.STRESS_BASE_URL || "http://localhost:3000"}`);
console.log("");

await runCases(cases, log);
const { failed } = log.summary();
process.exit(failed > 0 ? 1 : 0);
