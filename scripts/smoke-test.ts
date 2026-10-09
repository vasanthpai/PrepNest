/// <reference types="node" />
/**
 * Smoke test: checks that a deployed PrepNest actually works.
 * Runs after every deploy (and can be run by hand against any environment).
 *
 *   node scripts/smoke-test.ts --url https://prepnest-staging.<sub>.workers.dev --env staging --version 0.1.0
 *
 * Retries for a short while, because a fresh deploy can take a few seconds to reach every edge.
 * Exits 1 if any check fails.
 */
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    url: { type: "string" },
    env: { type: "string" },
    version: { type: "string" },
    attempts: { type: "string", default: "10" },
  },
});

if (!values.url || !values.env || !values.version) {
  console.error(
    "Usage: smoke-test.ts --url <base-url> --env <local|staging|production> --version <x.y.z>",
  );
  process.exit(2);
}

const baseUrl = values.url.replace(/\/$/, "");
const expectedEnv = values.env;
const expectedVersion = values.version;
const attempts = Number(values.attempts);

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

async function get(path: string): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    headers: { "user-agent": "prepnest-smoke-test" },
    signal: AbortSignal.timeout(10_000),
  });
}

async function checkHealth(): Promise<CheckResult> {
  const name = "GET /api/health";
  const response = await get("/api/health");
  if (response.status !== 200) return { name, ok: false, detail: `HTTP ${response.status}` };
  const body = (await response.json()) as Record<string, unknown>;
  const problems: string[] = [];
  if (body["status"] !== "ok") problems.push(`status=${String(body["status"])}`);
  if (body["env"] !== expectedEnv)
    problems.push(`env=${String(body["env"])} (want ${expectedEnv})`);
  if (body["version"] !== expectedVersion)
    problems.push(`version=${String(body["version"])} (want ${expectedVersion})`);
  if (!response.headers.get("cache-control")?.includes("no-store")) problems.push("not no-store");
  return problems.length
    ? { name, ok: false, detail: problems.join(", ") }
    : { name, ok: true, detail: `env=${expectedEnv} version=${expectedVersion}` };
}

async function checkHome(): Promise<CheckResult> {
  const name = "GET /";
  const response = await get("/");
  if (response.status !== 200) return { name, ok: false, detail: `HTTP ${response.status}` };
  const html = await response.text();
  const noindex = html.includes('name="robots" content="noindex');
  const shouldBeNoindex = expectedEnv !== "production";
  if (!html.includes("Learn")) return { name, ok: false, detail: "home page content missing" };
  if (noindex !== shouldBeNoindex) {
    return {
      name,
      ok: false,
      detail: shouldBeNoindex ? "missing noindex outside production" : "noindex in production",
    };
  }
  return { name, ok: true, detail: shouldBeNoindex ? "renders, noindex" : "renders, indexable" };
}

async function checkFavicon(): Promise<CheckResult> {
  const response = await get("/favicon.svg");
  return {
    name: "GET /favicon.svg",
    ok: response.status === 200,
    detail: `HTTP ${response.status}`,
  };
}

async function runAll(): Promise<CheckResult[]> {
  const checks = [checkHealth, checkHome, checkFavicon];
  return Promise.all(
    checks.map((check) =>
      check().catch((error: unknown) => ({
        name: check.name,
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      })),
    ),
  );
}

let results: CheckResult[] = [];
for (let attempt = 1; attempt <= attempts; attempt++) {
  results = await runAll();
  if (results.every((result) => result.ok)) break;
  if (attempt < attempts) {
    console.log(`Attempt ${attempt}/${attempts} failed; retrying in 3 s…`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

console.log(`\nSmoke test: ${baseUrl}`);
for (const result of results) {
  console.log(`  ${result.ok ? "✓" : "✗"} ${result.name.padEnd(18)} ${result.detail}`);
}

if (results.some((result) => !result.ok)) {
  console.error("\nSmoke test FAILED");
  process.exit(1);
}
console.log("\nSmoke test passed");
