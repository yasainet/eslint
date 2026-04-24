import { localPlugin } from "./local-plugins/index.mjs";

/** Scope layer rules to the given feature root. */
export function createLayersConfigs(featureRoot) {
  const loggerSelector = "CallExpression[callee.object.name='logger']";
  const loggerMessage =
    "logger is not allowed outside interactors. Logging belongs in interactors.";

  return [
    // Logger/console: all features except interactors
    {
      name: "layers/logger",
      files: [`${featureRoot}/**/*.ts`],
      ignores: [`${featureRoot}/**/interactors/*.ts`],
      rules: {
        "no-console": "error",
        "no-restricted-syntax": [
          "error",
          { selector: loggerSelector, message: loggerMessage },
        ],
      },
    },
    // Queries: try-catch + if + loops + logger
    {
      name: "layers/queries",
      files: [`${featureRoot}/**/queries/*.ts`],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "TryStatement",
            message:
              "try-catch is not allowed in queries. Error handling belongs in interactors.",
          },
          {
            selector: "IfStatement",
            message:
              "if statements are not allowed in queries. Conditional logic belongs in services.",
          },
          {
            selector: "ForStatement",
            message:
              "Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.",
          },
          {
            selector: "ForOfStatement",
            message:
              "Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.",
          },
          {
            selector: "ForInStatement",
            message:
              "Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.",
          },
          {
            selector: "WhileStatement",
            message:
              "Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.",
          },
          {
            selector: "DoWhileStatement",
            message:
              "Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.",
          },
          {
            selector: "ThrowStatement",
            message:
              "throw is not allowed in queries. Queries must return Supabase's { data, error } shape as-is. Error handling belongs in interactors.",
          },
          { selector: loggerSelector, message: loggerMessage },
        ],
      },
    },
    // Boundary type safety: queries & services must not leak `any`
    // into their public API. Uses type-aware inspection of the inferred
    // return type so unannotated functions are still checked.
    {
      name: "layers/no-any-return",
      files: [
        `${featureRoot}/**/queries/*.ts`,
        `${featureRoot}/**/services/*.ts`,
      ],
      plugins: { local: localPlugin },
      rules: {
        "local/no-any-return": "error",
      },
    },
    // Services: try-catch + logger + dead error fallbacks
    {
      name: "layers/services",
      files: [`${featureRoot}/**/services/*.ts`],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "TryStatement",
            message:
              "try-catch is not allowed in services. Error handling belongs in interactors.",
          },
          { selector: loggerSelector, message: loggerMessage },
          {
            selector:
              "LogicalExpression[operator='??'][left.type='ChainExpression'][left.expression.property.name='message'][right.type='Literal']",
            message:
              "Dead fallback for error message. If you reached this branch the error is known — return the error directly. Unhandled exceptions belong in interactors.",
          },
          {
            selector:
              "LogicalExpression[operator='??'][left.type='MemberExpression'][left.property.name='error'][right.type='ObjectExpression']",
            message:
              "Dead fallback for nullable error. Check `if (error)` and return the error directly. Unhandled exceptions belong in interactors.",
          },
        ],
      },
    },
  ];
}
