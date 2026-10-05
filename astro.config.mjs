// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  adapter: cloudflare(),
  integrations: [react()],
  // Auth is handled by Clerk (v0.3), so we don't need Astro sessions.
  // Disabling them stops the adapter from requiring a SESSION KV namespace.
  session: false,
  vite: {
    plugins: [tailwindcss()],
  },
});