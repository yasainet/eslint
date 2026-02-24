/**
 * @fileoverview Base ESLint configurations including Next.js presets and shared rules.
 */

import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import {
  reactYouMightNotNeedAnEffect,
  simpleImportSortPlugin,
  stylistic,
} from "./plugins.mjs";

/**
 * Next.js base configurations (core-web-vitals + typescript).
 * @type {import("eslint").Linter.Config[]}
 */
export const baseConfigs = [...nextVitals, ...nextTs];

/**
 * Global ignore patterns for build outputs and generated files.
 * @type {import("eslint").Linter.Config}
 */
export const ignoresConfig = globalIgnores([
  ".backup/**", // NOTE: Not a default.
  ".next/**",
  "out/**",
  "build/**",
  "next-env.d.ts",
]);

/**
 * Shared rules applied to all files.
 * Includes stylistic rules, import sorting, and TypeScript best practices.
 * @type {import("eslint").Linter.Config}
 */
export const sharedRulesConfig = {
  name: "shared-rules",
  plugins: {
    "@stylistic": stylistic,
    "react-you-might-not-need-an-effect": reactYouMightNotNeedAnEffect,
    "simple-import-sort": simpleImportSortPlugin,
  },
  rules: {
    ...reactYouMightNotNeedAnEffect.configs.recommended.rules,
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn",
    "no-irregular-whitespace": [
      "warn",
      {
        skipStrings: false,
        skipComments: false,
        skipRegExps: false,
        skipTemplates: false,
      },
    ],
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
    "@stylistic/quotes": ["warn", "double", { avoidEscape: true }],
  },
};
