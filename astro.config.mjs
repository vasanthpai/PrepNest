// @ts-check
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import { buildSiteUrl } from "./src/config/urls.ts";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Absolute URL of this build: canonical links, Open Graph, sitemap (PR previews use their own).
  site: buildSiteUrl({
    CLOUDFLARE_ENV: process.env["CLOUDFLARE_ENV"],
    PREVIEW_PR: process.env["PREVIEW_PR"],
  }),
  adapter: cloudflare({
    // Optimize images once at build time (free) instead of per request
    // with the Cloudflare Images binding (separate product with its own limits).
    imageService: "compile",
  }),
  // URLs without a trailing slash (/blog/my-post), built as blog/my-post.html. Cloudflare serves
  // that file at /blog/my-post directly, avoiding a redirect round-trip on every link.
  trailingSlash: "never",
  build: {
    format: "file",
    // CSS inside the HTML: no extra round trip before first paint (measured: FCP/LCP -150 ms on
    // slow 4G, +2 KB per page). Best for first visits from search on phones.
    inlineStylesheets: "always",
  },
  // Self-hosted variable fonts via Astro's Fonts API, preloaded by BaseLayout. Latin subset only.
  // display "optional": the font is used only if it arrives within ~100 ms (preload makes that the
  // normal case); otherwise the page keeps the fallback and never swaps, so text can't jump.
  // CI measured CLS 0.127 on the home page with "swap" on Linux, where the Arial-matched fallback
  // isn't available (same on Android). Metric-matched fallbacks are still generated.
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Bricolage Grotesque",
      cssVariable: "--font-bricolage",
      fallbacks: ["system-ui", "sans-serif"],
      display: "optional",
      options: {
        variants: [
          {
            src: [
              "./node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2",
            ],
            weight: "200 800",
            style: "normal",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Atkinson Hyperlegible Next",
      cssVariable: "--font-atkinson",
      fallbacks: ["system-ui", "sans-serif"],
      display: "optional",
      options: {
        variants: [
          {
            src: [
              "./node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2",
            ],
            weight: "200 800",
            style: "normal",
          },
        ],
      },
    },
  ],
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
