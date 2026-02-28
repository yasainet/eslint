import jsdocPlugin from "eslint-plugin-jsdoc";

import { featuresGlob } from "./constants.mjs";

/** @description Scope JSDoc rules to the given feature root */
export function createJsdocConfigs(featureRoot) {
  return [
    {
      name: "jsdoc",
      files: [
        ...featuresGlob(featureRoot, "**/repositories/*.ts"),
        ...featuresGlob(featureRoot, "**/services*/*.ts"),
        ...featuresGlob(featureRoot, "**/utils*/*.ts"),
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
}
