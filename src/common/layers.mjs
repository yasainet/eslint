/** @description Scope layer rules to the given feature root */
export function createLayersConfigs(featureRoot) {
  const loggerSelector = "CallExpression[callee.object.name='logger']";
  const loggerMessage =
    "logger is not allowed outside actions. Logging belongs in actions.";

  return [
    // Logger/console: all features except actions
    {
      name: "layers/logger",
      files: [`${featureRoot}/**/*.ts`],
      ignores: [`${featureRoot}/**/actions/*.ts`],
      rules: {
        "no-console": "error",
        "no-restricted-syntax": [
          "error",
          { selector: loggerSelector, message: loggerMessage },
        ],
      },
    },
    // Repositories: try-catch + if + logger
    {
      name: "layers/repositories",
      files: [`${featureRoot}/**/repositories/*.ts`],
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
          { selector: loggerSelector, message: loggerMessage },
        ],
      },
    },
    // Services: try-catch + logger
    {
      name: "layers/services",
      files: [`${featureRoot}/**/services/*.ts`],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "TryStatement",
            message:
              "try-catch is not allowed in services. Error handling belongs in actions.",
          },
          { selector: loggerSelector, message: loggerMessage },
        ],
      },
    },
  ];
}
