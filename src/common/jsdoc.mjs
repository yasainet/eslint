import jsdocPlugin from "eslint-plugin-jsdoc";

import { featuresGlob } from "./constants.mjs";

export const jsdocConfigs = [
  {
    name: "jsdoc",
    files: [
      ...featuresGlob("**/repositories/*.ts"),
      ...featuresGlob("**/services*/*.ts"),
      ...featuresGlob("**/utils*/*.ts"),
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
