/// <reference types="node" />
import { defineConfig } from "@playwright/test";

const PORT = 4321;
const isCI = Boolean(process.env["CI"]);

/**
 * Browser (end-to-end) tests. They run against the production build served by `astro preview`
 * (Cloudflare's workerd runtime), so build first: `npm run build && npm run test:e2e`.
 * Guide: docs/testing.md
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  // One retry in CI surfaces flaky tests in the report without failing the run on a hiccup.
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Full Chromium in headless mode (the separate headless-shell download isn't needed).
    channel: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "phone", use: { viewport: { width: 360, height: 780 }, hasTouch: true } },
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: `npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
});
