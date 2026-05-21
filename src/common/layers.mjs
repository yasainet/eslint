import { localPlugin } from "./local-plugins/index.mjs";

export function createLayersConfigs(featureRoot, { typeAware = true } = {}) {
  const loggerSelector = "CallExpression[callee.object.name='logger']";
  const loggerMessage =
    "logger is not allowed outside entries. Logging belongs in entries.";

  const aliasDynamicImportSelector =
    "ImportExpression[source.type='Literal'][source.value=/^@\\//]";
  const aliasDynamicImportMessage =
    "Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.";

  const noAnyReturnConfig = {
    name: "layers/no-any-return",
    files: [
      `${featureRoot}/**/queries/*.ts`,
      `${featureRoot}/**/services/*.ts`,
    ],
    plugins: { local: localPlugin },
    rules: {
      "local/no-any-return": "error",
    },
  };

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
    {
      name: "layers/queries",
      files: [`${featureRoot}/**/queries/*.ts`],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "TryStatement",
            message:
              "try-catch is not allowed in queries. Error handling belongs in entries.",
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
              "throw is not allowed in queries. Queries must return Supabase's { data, error } shape as-is. Error handling belongs in entries.",
          },
          { selector: loggerSelector, message: loggerMessage },
          {
            selector: aliasDynamicImportSelector,
            message: aliasDynamicImportMessage,
          },
        ],
      },
    },
    ...(typeAware ? [noAnyReturnConfig] : []),
    {
      name: "layers/services",
      files: [`${featureRoot}/**/services/*.ts`],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "TryStatement",
            message:
              "try-catch is not allowed in services. Error handling belongs in entries.",
          },
          {
            selector: "ThrowStatement",
            message:
              "throw is not allowed in services. Communicate failures via T | null / { data, error } / empty default. Native exceptions from libs auto-propagate to entry's catch.",
          },
          { selector: loggerSelector, message: loggerMessage },
          {
            selector:
              "LogicalExpression[operator='??'][left.type='ChainExpression'][left.expression.property.name='message'][right.type='Literal']",
            message:
              "Dead fallback for error message. If you reached this branch the error is known — return the error directly. Unhandled exceptions belong in entries.",
          },
          {
            selector:
              "LogicalExpression[operator='??'][left.type='MemberExpression'][left.property.name='error'][right.type='ObjectExpression']",
            message:
              "Dead fallback for nullable error. Check `if (error)` and return the error directly. Unhandled exceptions belong in entries.",
          },
          {
            selector: aliasDynamicImportSelector,
            message: aliasDynamicImportMessage,
          },
        ],
      },
    },
    {
      name: "layers/entries",
      files: [`${featureRoot}/**/entries/*.ts`],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: aliasDynamicImportSelector,
            message: aliasDynamicImportMessage,
          },
        ],
      },
    },
  ];
}
