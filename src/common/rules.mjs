import tseslint from "typescript-eslint";

import { simpleImportSortPlugin, stylistic } from "./plugins.mjs";

export const rulesConfigs = [
  {
    name: "rules/shared",
    plugins: {
      "@stylistic": stylistic,
      "simple-import-sort": simpleImportSortPlugin,
    },
    rules: {
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
  {
    name: "rules/typescript",
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
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
    },
  },
];
