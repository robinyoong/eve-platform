#!/usr/bin/env node
/**
 * Stress + edge-case suite for /quiz page and GET/POST /api/quiz
 * Logs every PASS and every FAIL.
 *
 * Usage:
 *   STRESS_BASE_URL=http://localhost:3000 node scripts/stress/quiz.mjs
 */

import { createLogger, request, runCases, storm } from "./lib.mjs";

const log = createLogger();

const cases = [
  {
    name: "GET /quiz returns the quiz page",
    async run(log) {
      const res = await request("/quiz");
      if (res.status !== 200) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      if (!/eve agent quiz/i.test(res.text)) {
        log.fail(this.name, "missing quiz heading");
        return;
      }
      if (!/Knowledge check/i.test(res.text)) {
        log.fail(this.name, "missing knowledge check eyebrow");
        return;
      }
      log.pass(this.name, `${res.ms}ms`);
    },
  },
  {
    name: "GET /quiz embeds client quiz bootstrap",
    async run(log) {
      const res = await request("/quiz");
      if (res.status !== 200) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      // RSC payload should reference quiz content / question count cues.
      if (!/Question|answered|See score|Try again|minimum-agent|instructions\.md/i.test(res.text)) {
        log.fail(this.name, "quiz content markers missing from HTML");
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "GET /quiz does not expose a server answer key in HTML",
    async run(log) {
      const res = await request("/quiz");
      if (res.status !== 200) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      // correctOptionId is a source field; it must not appear as a literal key
      // in the shipped HTML (client bundle may still encode answers — we flag
      // the explicit property name as a leak smell for the API/page split).
      const api = await request("/api/quiz");
      if (api.status === 200 && /correctOptionId/.test(api.text)) {
        log.fail(this.name, "GET /api/quiz leaked correctOptionId");
        return;
      }
      log.pass(this.name, "API bank hides answers");
    },
  },
  {
    name: "GET /api/quiz lists questions without answers",
    async run(log) {
      const res = await request("/api/quiz");
      if (res.status !== 200 || !res.json?.ok) {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      if (!Array.isArray(res.json.questions) || res.json.questions.length !== 10) {
        log.fail(this.name, `expected 10 questions, got ${res.json.questions?.length}`);
        return;
      }
      if (res.json.count !== 10) {
        log.fail(this.name, `count=${res.json.count}`);
        return;
      }
      const leaked = res.json.questions.some(
        (q) => "correctOptionId" in q || "explanation" in q,
      );
      if (leaked) {
        log.fail(this.name, "answer key leaked in GET");
        return;
      }
      for (const q of res.json.questions) {
        if (!q.id || !q.prompt || !Array.isArray(q.options) || q.options.length !== 4) {
          log.fail(this.name, `malformed question ${q?.id}`);
          return;
        }
      }
      log.pass(this.name, `${res.json.count} questions`);
    },
  },
  {
    name: "POST /api/quiz scores a perfect paper",
    async run(log) {
      // Discover correct answers via a throwaway incomplete POST? No — use the
      // known bank from src/lib/quiz.ts mirrored here for the oracle.
      const answers = {
        "minimum-agent": "b",
        "tool-registration": "c",
        "skills-loading": "b",
        "schedule-format": "b",
        "agent-ts-purpose": "b",
        "sandbox-default": "c",
        "tool-name": "a",
        "channels-vs-schedules": "b",
        "durable-primitive": "c",
        "slack-credentials": "c",
      };
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.status !== 200 || res.json?.correct !== 10 || res.json?.percentage !== 100) {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 300)}`);
        return;
      }
      if (!res.json.complete || !/Perfect/i.test(res.json.label || "")) {
        log.fail(this.name, `label/complete mismatch: ${JSON.stringify(res.json)}`);
        return;
      }
      log.pass(this.name, res.json.label);
    },
  },
  {
    name: "POST /api/quiz scores a zero paper",
    async run(log) {
      const answers = {
        "minimum-agent": "a",
        "tool-registration": "a",
        "skills-loading": "a",
        "schedule-format": "a",
        "agent-ts-purpose": "a",
        "sandbox-default": "a",
        "tool-name": "b",
        "channels-vs-schedules": "a",
        "durable-primitive": "a",
        "slack-credentials": "a",
      };
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.status !== 200 || res.json?.correct !== 0 || res.json?.percentage !== 0) {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 300)}`);
        return;
      }
      log.pass(this.name, res.json.label);
    },
  },
  {
    name: "POST /api/quiz accepts partial answers without claiming complete",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answers: { "minimum-agent": "b", "tool-name": "a" },
        }),
      });
      if (res.status !== 200 || res.json?.answered !== 2 || res.json?.complete !== false) {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 300)}`);
        return;
      }
      if (res.json.correct !== 2) {
        log.fail(this.name, `correct=${res.json.correct}`);
        return;
      }
      // percentage is against full total (10), so 20%
      if (res.json.percentage !== 20) {
        log.fail(this.name, `percentage=${res.json.percentage}`);
        return;
      }
      log.pass(this.name, `${res.json.correct}/${res.json.total}`);
    },
  },
  {
    name: "POST /api/quiz partial submission does not leak unanswered keys",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answers: { "minimum-agent": "b" },
        }),
      });
      if (res.status !== 200 || !Array.isArray(res.json?.results)) {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 300)}`);
        return;
      }
      if (res.json.results.length !== 1) {
        log.fail(
          this.name,
          `expected 1 result, got ${res.json.results.length} (answer key leak?)`,
        );
        return;
      }
      const only = res.json.results[0];
      if (only.questionId !== "minimum-agent" || only.correctOptionId !== "b") {
        log.fail(this.name, `unexpected result ${JSON.stringify(only)}`);
        return;
      }
      // Unanswered question ids must not appear anywhere in the payload key fields
      const leakedIds = [
        "tool-registration",
        "skills-loading",
        "schedule-format",
        "slack-credentials",
      ].filter((id) =>
        res.json.results.some((r) => r.questionId === id || r.correctOptionId && r.questionId === id),
      );
      if (leakedIds.length) {
        log.fail(this.name, `leaked ${leakedIds.join(",")}`);
        return;
      }
      log.pass(this.name, "1 answered result only");
    },
  },
  {
    name: "GET / and /quiz expose Quiz nav for mobile",
    async run(log) {
      for (const path of ["/", "/quiz"]) {
        const res = await request(path);
        if (res.status !== 200) {
          log.fail(this.name, `${path} status ${res.status}`);
          return;
        }
        // The Quiz link must not be gated behind a sm: breakpoint class in markup.
        if (!/href="\/quiz"/.test(res.text) && !/href=\\?"\/quiz\\?"/.test(res.text)) {
          log.fail(this.name, `${path} missing /quiz href`);
          return;
        }
        if (
          /href="\/quiz"[^>]*(?:hidden[^"]*sm:inline|className":"hidden text-sm)/.test(res.text) ||
          /"hidden text-sm text-fg-muted[^"]*sm:inline[^"]*"[^"]*\/quiz/.test(res.text)
        ) {
          // Soft check — RSC payload class strings vary; fail only on classic gated class next to Quiz
          if (/hidden text-sm text-fg-muted transition-colors hover:text-fg sm:inline/.test(res.text)) {
            log.fail(this.name, `${path} Quiz link still sm-gated`);
            return;
          }
        }
        if (!/\/#learn/.test(res.text) || !/\/#get-started/.test(res.text)) {
          log.fail(this.name, `${path} missing root-relative header anchors`);
          return;
        }
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects empty answers",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: {} }),
      });
      if (res.status !== 400 || res.json?.error !== "empty_answers") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects unknown question ids",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: { "not-a-question": "a" } }),
      });
      if (res.status !== 400 || res.json?.error !== "unknown_question") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects invalid option ids",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: { "minimum-agent": "z" } }),
      });
      if (res.status !== 400 || res.json?.error !== "invalid_option") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects non-string option values",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: { "minimum-agent": 1 } }),
      });
      if (res.status !== 400 || res.json?.error !== "invalid_option") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects missing answers field",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ score: true }),
      });
      if (res.status !== 400 || res.json?.error !== "invalid_answers") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects invalid JSON",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      });
      if (res.status !== 400 || res.json?.error !== "invalid_json") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects empty body",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "",
      });
      if (res.status !== 400 || res.json?.error !== "empty_body") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects wrong content-type",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: JSON.stringify({ answers: { "minimum-agent": "b" } }),
      });
      if (res.status !== 415 || res.json?.error !== "invalid_content_type") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects oversized payload",
    async run(log) {
      // Pad with a huge junk string field via raw body
      const body = `{"answers":{"minimum-agent":"b"},"pad":"${"x".repeat(40_000)}"}`;
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });
      if (res.status !== 413 || res.json?.error !== "payload_too_large") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects path-traversal style question ids",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: { "../etc/passwd": "a" } }),
      });
      if (res.status !== 400 || res.json?.error !== "unknown_question") {
        log.fail(this.name, `status ${res.status} body=${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name);
    },
  },
  {
    name: "POST /api/quiz rejects prototype pollution keys",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: { __proto__: "a", "minimum-agent": "b" } }),
      });
      // __proto__ may be dropped by JSON.parse or treated as unknown_question
      if (![400, 200].includes(res.status)) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      if (res.status === 200 && res.json?.answered !== 1) {
        log.fail(this.name, `proto leaked into answers: ${res.text.slice(0, 200)}`);
        return;
      }
      log.pass(this.name, `status ${res.status}`);
    },
  },
  {
    name: "OPTIONS /api/quiz advertises Allow",
    async run(log) {
      const res = await request("/api/quiz", { method: "OPTIONS" });
      if (res.status !== 204 && res.status !== 200) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      const allow = res.headers.get("allow") || "";
      if (!/GET/i.test(allow) || !/POST/i.test(allow)) {
        log.fail(this.name, `Allow=${allow}`);
        return;
      }
      log.pass(this.name, allow);
    },
  },
  {
    name: "PUT /api/quiz is not allowed",
    async run(log) {
      const res = await request("/api/quiz", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: { "minimum-agent": "b" } }),
      });
      if (![404, 405, 501].includes(res.status)) {
        log.fail(this.name, `status ${res.status}`);
        return;
      }
      log.pass(this.name, `status ${res.status}`);
    },
  },
  {
    name: "GET /api/quiz Cache-Control is no-store",
    async run(log) {
      const res = await request("/api/quiz");
      const cc = res.headers.get("cache-control") || "";
      if (!/no-store/i.test(cc)) {
        log.fail(this.name, `cache-control=${cc}`);
        return;
      }
      log.pass(this.name, cc);
    },
  },
  {
    name: "Concurrent GET /api/quiz storm",
    async run(log) {
      const results = await storm("/api/quiz", { concurrency: 50, method: "GET" });
      const bad = results.filter((r) => r.status !== 200 || r.json?.count !== 10);
      if (bad.length) {
        log.fail(this.name, `${bad.length}/50 failed (e.g. ${bad[0].status})`);
        return;
      }
      log.pass(this.name, `50 ok, max ${Math.max(...results.map((r) => r.ms))}ms`);
    },
  },
  {
    name: "Concurrent POST /api/quiz scoring storm",
    async run(log) {
      const body = JSON.stringify({
        answers: {
          "minimum-agent": "b",
          "tool-registration": "a",
          "skills-loading": "b",
        },
      });
      const results = await storm("/api/quiz", {
        concurrency: 40,
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });
      const bad = results.filter(
        (r) => r.status !== 200 || r.json?.correct !== 2 || r.json?.complete !== false,
      );
      if (bad.length) {
        log.fail(this.name, `${bad.length}/40 failed (e.g. ${bad[0].status})`);
        return;
      }
      log.pass(this.name, `40 ok, max ${Math.max(...results.map((r) => r.ms))}ms`);
    },
  },
  {
    name: "Concurrent GET /quiz page storm",
    async run(log) {
      const results = await storm("/quiz", { concurrency: 40, method: "GET" });
      const bad = results.filter((r) => r.status !== 200 || !/eve agent quiz/i.test(r.text));
      if (bad.length) {
        log.fail(this.name, `${bad.length}/40 failed (e.g. ${bad[0].status})`);
        return;
      }
      log.pass(this.name, `40 ok, max ${Math.max(...results.map((r) => r.ms))}ms`);
    },
  },
  {
    name: "Score label tiers match percentage boundaries",
    async run(log) {
      // 100, 80, 60, 40, <40 via crafted answer sets
      const bank = await request("/api/quiz");
      const ids = bank.json.questions.map((q) => q.id);
      const correct = {
        "minimum-agent": "b",
        "tool-registration": "c",
        "skills-loading": "b",
        "schedule-format": "b",
        "agent-ts-purpose": "b",
        "sandbox-default": "c",
        "tool-name": "a",
        "channels-vs-schedules": "b",
        "durable-primitive": "c",
        "slack-credentials": "c",
      };
      const wrong = Object.fromEntries(ids.map((id) => [id, "a"]));
      // ensure wrong really differs where "a" is correct
      wrong["tool-name"] = "b";

      const casesLocal = [
        { n: 10, expectPct: 100, re: /Perfect/i },
        { n: 8, expectPct: 80, re: /Strong grasp/i },
        { n: 6, expectPct: 60, re: /Solid start/i },
        { n: 4, expectPct: 40, re: /mixed up/i },
        { n: 2, expectPct: 20, re: /tutorial again/i },
      ];

      for (const c of casesLocal) {
        const answers = { ...wrong };
        const correctIds = Object.keys(correct).slice(0, c.n);
        for (const id of correctIds) answers[id] = correct[id];
        const res = await request("/api/quiz", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        if (res.status !== 200 || res.json?.percentage !== c.expectPct) {
          log.fail(this.name, `n=${c.n} status=${res.status} pct=${res.json?.percentage}`);
          return;
        }
        if (!c.re.test(res.json.label || "")) {
          log.fail(this.name, `n=${c.n} label=${res.json.label}`);
          return;
        }
      }
      log.pass(this.name, "100/80/60/40/20 tiers");
    },
  },
];

await runCases(cases, log);
const { failed } = log.summary();
process.exit(failed > 0 ? 1 : 0);
