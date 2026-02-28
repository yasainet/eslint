/** @description Scope layer rules to the given feature root */
export function createLayersConfigs(featureRoot) {
  return [
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
        ],
      },
    },
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
        ],
      },
    },
  ];
}
