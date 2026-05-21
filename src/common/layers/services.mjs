import { featuresGlob } from "../_internal/constants.mjs";
import { LIB_BOUNDARY_PATTERNS } from "../_internal/import-patterns.mjs";
import { checkFile } from "../_internal/plugins.mjs";
import {
  aliasDynamicImportMessage,
  aliasDynamicImportSelector,
  loggerMessage,
  loggerSelector,
} from "../_internal/selectors.mjs";

const LAYER_PATTERNS = [
  {
    group: ["**/entries/*", "**/entries"],
    message: "services cannot import entries (layer violation)",
  },
  {
    group: ["**/hooks/*", "**/hooks"],
    message: "services cannot import hooks (layer violation)",
  },
];

const LATERAL_PATTERNS = [
  {
    group: ["@/features/*/services/*", "@/features/*/services"],
    message:
      "services cannot import other feature's services (lateral violation)",
  },
];

export function createServicesConfigs({ featureRoot, prefixLibMapping }) {
  const prefixes = Object.keys(prefixLibMapping);
  const hasPrefixes = prefixes.length > 0;
  const prefixPattern = hasPrefixes ? `@(${prefixes.join("|")})` : "*";
  const sharedPrefixPattern = hasPrefixes
    ? `@(shared|${prefixes.join("|")})`
    : "shared";

  return [
    {
      name: "naming/services",
      files: featuresGlob(featureRoot, "**/services/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/services/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": prefixPattern },
        ],
      },
    },
    {
      name: "naming/services-shared",
      files: featuresGlob(featureRoot, "shared/services/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
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
      name: "imports/services",
      files: [`${featureRoot}/**/services/*.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              ...LAYER_PATTERNS,
              ...LATERAL_PATTERNS,
              ...LIB_BOUNDARY_PATTERNS,
            ],
          },
        ],
      },
    },
  ];
}
