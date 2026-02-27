/**
 * @fileoverview Layer architecture constraints.
 *
 * Enforces syntax restrictions per layer:
 * - Repositories: No try-catch or if statements
 * - Services: No try-catch
 * - Actions: Exported functions must start with "handle"
 * - Hooks: Exported functions must start with "use"
 *
 * Import restrictions (layer, cross-feature, cardinality, lib-boundary)
 * are consolidated in imports.mjs to avoid flat-config "last wins" override.
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
            "if statements are not allowed in repositories. Conditional logic belongs in services.",
        },
      ],
    },
  },
  {
    name: "layers/services",
    files: ["**/services/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "TryStatement",
          message:
            "try-catch is not allowed in services. Error handling belongs in actions.",
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
