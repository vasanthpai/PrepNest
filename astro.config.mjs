// @ts-check
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { siteUrlFor } from "./src/config/urls.ts";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Absolute URL of this environment: canonical links, Open Graph, sitemap.
  site: siteUrlFor(process.env.CLOUDFLARE_ENV),
  adapter: cloudflare({
    // Optimize images once at build time (free) instead of per request
    // with the Cloudflare Images binding (separate product with its own limits).
    imageService: "compile",
  }),
  // URLs without a trailing slash (/blog/my-post), built as blog/my-post.html. Cloudflare serves
  // that file at /blog/my-post directly, avoiding a redirect round-trip on every link.
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [react(), mdx()],
  markdown: {
    // Code blocks use CSS variables instead of fixed colours, so they follow the Syntax design
    // tokens and switch with light/dark mode (mapped in src/styles/global.css).
    shikiConfig: { theme: "css-variables" },
  },
  // Auth is handled by Clerk (v0.3), so we don't need Astro sessions.
  // Disabling them stops the adapter from requiring a SESSION KV namespace.
  session: false,
  vite: {
    plugins: [tailwindcss()],
  },
});
