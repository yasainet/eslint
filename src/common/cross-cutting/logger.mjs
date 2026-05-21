import {
  loggerMessage,
  loggerSelector,
} from "../_internal/selectors.mjs";

export function createLoggerConfigs({ featureRoot }) {
  return [
    {
      name: "layers/logger",
      files: [`${featureRoot}/**/*.ts`],
      ignores: [`${featureRoot}/**/entries/*.ts`],
      rules: {
        "no-console": "error",
        "no-restricted-syntax": [
          "error",
          { selector: loggerSelector, message: loggerMessage },
        ],
      },
    },
  ];
}
