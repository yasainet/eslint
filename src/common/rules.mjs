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

const sharedRulesConfig = {
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
};

const syntacticTypeScriptRules = {
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
};

const typeAwareTypeScriptRules = {
  // Detect defensive fallbacks on non-nullable values (e.g., `?? ''`
  // on a non-null column). Promoted to error once consuming projects
  // (bitcomic.net, getpayme.net) reached 0 warnings.
  "@typescript-eslint/no-unnecessary-condition": "error",
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
};

const typeAwareRulesOff = Object.fromEntries(
  Object.keys(typeAwareTypeScriptRules).map((rule) => [rule, "off"]),
);

/**
 * Build base rule configs:
 *
 * - `typeAware: true` (default) enables `projectService` and type-aware rules
 *   (`no-unnecessary-condition`, `no-floating-promises`, `no-unsafe-*`, etc.)
 *   for the matched `files`
 * - `typeAware: false` disables `projectService` and forces type-aware rules
 *   off for the matched `files`. Use for files outside the project tsconfig
 *   (e.g., Deno files in Supabase Edge Functions)
 *
 * `files` defaults to all TypeScript sources. When combining multiple entries
 * (e.g., next + deno), pass a narrow pattern so the type-aware override only
 * applies to its target files.
 */
export function createRulesConfigs({
  typeAware = true,
  files = ["**/*.ts", "**/*.tsx"],
} = {}) {
  return [
    sharedRulesConfig,
    {
      name: "rules/typescript",
      files,
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: typeAware
          ? { projectService: true, tsconfigRootDir: projectRoot }
          : { projectService: false, project: null },
      },
      plugins: {
        "@typescript-eslint": tseslint.plugin,
      },
      rules: {
        ...syntacticTypeScriptRules,
        ...(typeAware ? typeAwareTypeScriptRules : typeAwareRulesOff),
      },
    },
  ];
}
