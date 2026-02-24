/**
 * @fileoverview Layer architecture constraints.
 *
 * Enforces the following dependency rules:
 *
 * Layer hierarchy (top to bottom):
 *   hooks → actions → domains → repositories
 *
 * Rules:
 * - Repositories: Cannot import domains, actions, or hooks.
 *                 Cannot use try-catch or if statements.
 * - Domains: Cannot import actions or hooks.
 *            Cannot use try-catch.
 * - Actions: Cannot import hooks.
 *            Exported functions must start with "handle".
 * - Hooks: Exported functions must start with "use".
 *
 * Cross-feature imports are also prohibited within the same layer.
 */

import { featuresGlob } from "./constants.mjs";

/**
 * Layer constraint configurations.
 * @type {import("eslint").Linter.Config[]}
 */
export const layersConfigs = [
  {
    name: "layers/repositories",
    files: ["**/repositories/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "TryStatement",
          message:
            "try-catch is not allowed in repositories. Error handling belongs in actions.",
        },
        {
          selector: "IfStatement",
          message:
            "if statements are not allowed in repositories. Conditional logic belongs in domain.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*/domains/*", "*/domains"],
              message: "repositories cannot import domains (layer violation)",
            },
            {
              group: ["*/actions/*", "*/actions"],
              message: "repositories cannot import actions (layer violation)",
            },
            {
              group: ["*/hooks/*", "*/hooks"],
              message: "repositories cannot import hooks (layer violation)",
            },
            {
              group: [
                "@/features/*/repositories/*",
                "@/features/*/repositories",
              ],
              message:
                "repositories cannot import other feature's repositories (cross-feature violation)",
            },
          ],
        },
      ],
    },
  },
  {
    name: "layers/domains",
    files: ["**/domains/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "TryStatement",
          message:
            "try-catch is not allowed in domain. Error handling belongs in actions.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*/actions/*", "*/actions"],
              message: "domains cannot import actions (layer violation)",
            },
            {
              group: ["*/hooks/*", "*/hooks"],
              message: "domains cannot import hooks (layer violation)",
            },
            {
              group: ["@/features/*/domains/*", "@/features/*/domains"],
              message:
                "domains cannot import other feature's domains (cross-feature violation)",
            },
          ],
        },
      ],
    },
  },
  {
    name: "layers/actions-naming",
    files: featuresGlob("**/actions/*.ts"),
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ExportNamedDeclaration > FunctionDeclaration[id.name!=/^handle[A-Z]/]",
          message:
            "Exported functions in actions must start with 'handle' (e.g., handleGetComics).",
        },
      ],
    },
  },
  {
    name: "layers/actions-imports",
    files: ["**/actions/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*/hooks/*", "*/hooks"],
              message: "actions cannot import hooks (layer violation)",
            },
            {
              group: ["@/features/*/actions/*", "@/features/*/actions"],
              message:
                "actions cannot import other feature's actions (cross-feature violation)",
            },
          ],
        },
      ],
    },
  },
  {
    name: "layers/hooks-naming",
    files: featuresGlob("**/hooks/*.ts"),
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ExportNamedDeclaration > FunctionDeclaration[id.name!=/^use[A-Z]/]",
          message:
            "Exported functions in hooks must start with 'use' (e.g., useAuth).",
        },
      ],
    },
  },
];
