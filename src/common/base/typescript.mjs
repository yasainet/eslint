import { existsSync } from "node:fs";
import { dirname, join, sep } from "node:path";

import tseslint from "typescript-eslint";

import { simpleImportSortPlugin, stylistic } from "../_internal/plugins.mjs";

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
  "@typescript-eslint/no-unnecessary-condition": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/no-misused-promises": "error",
  "@typescript-eslint/await-thenable": "error",
  "@typescript-eslint/require-await": "error",
  "@typescript-eslint/no-unsafe-assignment": "error",
  "@typescript-eslint/no-unsafe-call": "error",
  "@typescript-eslint/no-unsafe-member-access": "error",
  "@typescript-eslint/no-unsafe-argument": "error",
  "@typescript-eslint/no-unsafe-return": "error",
};

const typeAwareRulesOff = Object.fromEntries(
  Object.keys(typeAwareTypeScriptRules).map((rule) => [rule, "off"]),
);

export function createTypescriptConfigs({
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
