#!/usr/bin/env node
/**
 * Run every available endpoint stress suite and log a combined summary.
 * Suites that 404 (endpoint not on this deployment) are reported as SKIPPED.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { request } from "./lib.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));

const suites = [
  { name: "health", probe: "/api/health", file: "health.mjs" },
  { name: "tutorial", probe: "/api/tutorial", file: "tutorial.mjs" },
];

async function runNode(file) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(root, file)], {
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

let failures = 0;

console.log("=== Combined endpoint stress suites ===");
console.log(`Base URL: ${process.env.STRESS_BASE_URL || "http://localhost:3000"}`);
console.log("");

for (const suite of suites) {
  const probe = await request(suite.probe).catch((err) => ({
    status: 0,
    text: err instanceof Error ? err.message : String(err),
  }));

  if (probe.status === 404) {
    console.log(`[SKIP] ${suite.name} — ${suite.probe} not deployed on this base URL`);
    console.log("");
    continue;
  }

  if (probe.status === 0) {
    console.log(`[FAIL] ${suite.name} — could not reach ${suite.probe}: ${probe.text}`);
    failures += 1;
    console.log("");
    continue;
  }

  console.log(`--- Running ${suite.name} suite ---`);
  const code = await runNode(suite.file);
  if (code !== 0) failures += 1;
  console.log("");
}

console.log(`=== Combined result: ${failures === 0 ? "ALL GREEN" : `${failures} suite(s) failed`} ===`);
process.exit(failures > 0 ? 1 : 0);
