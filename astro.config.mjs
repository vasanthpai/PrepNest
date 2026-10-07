// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  adapter: cloudflare({
    // Optimize images once at build time (free) instead of per request
    // with the Cloudflare Images binding (separate product with its own limits).
    imageService: "compile",
  }),
  integrations: [react()],
  // Auth is handled by Clerk (v0.3), so we don't need Astro sessions.
  // Disabling them stops the adapter from requiring a SESSION KV namespace.
  session: false,
  vite: {
    plugins: [tailwindcss()],
  },
});
