/**
 * @fileoverview Shared rules applied to all files.
 *
 * Includes TypeScript best practices, stylistic rules, and import sorting.
 */

import { simpleImportSortPlugin, stylistic } from "./plugins.mjs";

/**
 * Common rule configurations.
 * @type {import("eslint").Linter.Config[]}
 */
export const rulesConfigs = [
  {
    name: "rules/shared",
    plugins: {
      "@stylistic": stylistic,
      "simple-import-sort": simpleImportSortPlugin,
    },
    rules: {
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
  },
];
