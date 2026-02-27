/**
 * @fileoverview JSDoc configuration for the abstraction layer.
 *
 * Enforces a single rule: every exported function must have a description.
 * Types are handled by TypeScript (machine layer), not JSDoc.
 *
 * Targets: repositories, services, util.
 * Excludes: actions, hooks, components, schemas, constants.
 */

import jsdocPlugin from "eslint-plugin-jsdoc";

import { featuresGlob } from "./constants.mjs";

/**
 * JSDoc configurations requiring descriptions on exported functions.
 * @type {import("eslint").Linter.Config[]}
 */
export const jsdocConfigs = [
  {
    name: "jsdoc",
    files: [
      ...featuresGlob("**/repositories/*.ts"),
      ...featuresGlob("**/services*/*.ts"),
      ...featuresGlob("**/util*/*.ts"),
    ],
    plugins: {
      jsdoc: jsdocPlugin,
    },
    rules: {
      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
          checkGetters: false,
          checkSetters: false,
          checkConstructors: false,
        },
      ],
      "jsdoc/require-description": [
        "warn",
        {
          contexts: ["any"],
        },
      ],
    },
  },
];
