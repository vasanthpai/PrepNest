/// <reference types="node" />
// Node types are referenced only here: app code runs on Cloudflare Workers, not Node.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests run in plain Node: fast, no Cloudflare runtime needed.
// Code that needs Workers APIs gets integration tests later.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
