// @ts-check
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y-x";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "dist/",
    ".astro/",
    ".wrangler/",
    "coverage/",
    "playwright-report/",
    "test-results/",
    "worker-configuration.d.ts",
  ]),

  // Base rules for all JS/TS
  js.configs.recommended,
  tseslint.configs.recommended,

  // Astro components (+ accessibility rules adapted for .astro)
  astro.configs.recommended,
  astro.configs["jsx-a11y-recommended"],

  // React islands
  {
    files: ["**/*.{jsx,tsx}"],
    extends: [jsxA11y.configs.recommended, reactHooks.configs.flat.recommended],
  },

  // Globals: browser for islands, node for config files
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // Project rules
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // Command-line scripts print their results
  {
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },

  // Must be last: turns off rules that conflict with Prettier
  prettier,
]);
