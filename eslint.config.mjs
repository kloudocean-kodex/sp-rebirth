import js from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import astroPlugin from "eslint-plugin-astro";
import globals from "globals";

export default [
  {
    ignores: [
      ".astro/**",
      ".wrangler/**",
      ".wrangler-dry-run/**",
      ".wrangler-dry-run-*/**",
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "studio/dist/**",
      "studio/.sanity/**",
    ],
  },
  js.configs.recommended,
  ...typescriptPlugin.configs["flat/recommended"],
  ...astroPlugin.configs["flat/recommended"],
  {
    files: [
      "**/*.config.{js,mjs,cjs}",
      "eslint.config.mjs",
      "scripts/**/*.{js,mjs,cjs}",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
  },
];
