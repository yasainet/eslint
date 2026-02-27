/**
 * @fileoverview Next.js-specific layer constraint.
 *
 * Enforces: exported functions in hooks must start with "use".
 */

import { featuresGlob } from "../common/constants.mjs";

/**
 * Next.js-specific layer constraint configurations.
 * @type {import("eslint").Linter.Config[]}
 */
export const layersConfigs = [
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
