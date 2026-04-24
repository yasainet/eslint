import { existsSync } from "node:fs";
import { dirname, join, sep } from "node:path";

import tseslint from "typescript-eslint";

import { simpleImportSortPlugin, stylistic } from "./plugins.mjs";

// When evaluated under LSP servers like vscode-eslint, `process.cwd()` returns
// the linted file's directory rather than the consumer's project root, so it
// cannot be used to derive `tsconfigRootDir`. Walk up from this module until a
// `tsconfig.json` outside of `node_modules` is found. Falls back to
// `process.cwd()` for CLI parity if no such directory is reachable.
const findProjectRoot = (start) => {
  let dir = start;
  while (dir !== dirname(dir)) {
    if (!dir.split(sep).includes("node_modules") && existsSync(join(dir, "tsconfig.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return process.cwd();
};

const projectRoot = findProjectRoot(import.meta.dirname);

/** Base rule configs for code style and TypeScript checks. */
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
      // Dead code detection: rules with no legitimate use case, so always safe to error.
      "no-unreachable": "error",
      "no-unreachable-loop": "error",
      "no-useless-return": "error",
      "no-constant-condition": "error",
      "no-constant-binary-expression": "error",
      "no-dupe-else-if": "error",
      "no-self-assign": "error",
      "no-self-compare": "error",
      "no-useless-catch": "error",
      "no-fallthrough": "error",
    },
  },
  {
    name: "rules/typescript",
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      // Enable type-aware linting so rules like `no-unnecessary-condition`
      // can consult the TypeScript type checker.
      parserOptions: {
        projectService: true,
        tsconfigRootDir: projectRoot,
      },
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
      // Detect defensive fallbacks on non-nullable values (e.g., `?? ''`
      // on a non-null column). Kept at warn until existing violations are
      // cleaned up across consuming projects; promote to error afterwards.
      "@typescript-eslint/no-unnecessary-condition": "warn",
      // Type-aware async safety: silent await omissions are a leading cause
      // of race conditions in server actions and background tasks.
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "error",
      // Type-aware `any` propagation checks: any が境界を越えた瞬間に
      // 残りのコードで型検査が無効化されるため、検出したら確実に止める。
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-return": "error",
    },
  },
];
