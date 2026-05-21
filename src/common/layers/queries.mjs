import { featuresGlob } from "../_internal/constants.mjs";
import { MAPPING_PATTERNS } from "../_internal/import-patterns.mjs";
import { checkFile } from "../_internal/plugins.mjs";
import {
  aliasDynamicImportMessage,
  aliasDynamicImportSelector,
  loggerMessage,
  loggerSelector,
} from "../_internal/selectors.mjs";
import { localPlugin } from "../local-plugins/index.mjs";

const LAYER_PATTERNS = [
  {
    group: ["**/services/*", "**/services"],
    message: "queries cannot import services (layer violation)",
  },
  {
    group: ["**/entries/*", "**/entries"],
    message: "queries cannot import entries (layer violation)",
  },
  {
    group: ["**/hooks/*", "**/hooks"],
    message: "queries cannot import hooks (layer violation)",
  },
];

const LATERAL_PATTERNS = [
  {
    group: ["@/features/*/queries/*", "@/features/*/queries"],
    message:
      "queries cannot import other feature's queries (lateral violation)",
  },
];

function prefixLibPatterns(prefix, mapping) {
  const prefixes = Object.keys(mapping);
  const allowedLib = mapping[prefix];
  return prefixes
    .filter((p) => p !== prefix)
    .map((p) => ({
      group: [`**/lib/${mapping[p]}`, `**/lib/${mapping[p]}/*`],
      message: `queries/${prefix}.ts can only import from lib/${allowedLib}. Use the correct query file for this lib.`,
    }));
}

export function createQueriesConfigs({ featureRoot, prefixLibMapping }) {
  const prefixes = Object.keys(prefixLibMapping);
  const hasPrefixes = prefixes.length > 0;
  const prefixPattern = hasPrefixes ? `@(${prefixes.join("|")})` : "*";
  const sharedPrefixPattern = hasPrefixes
    ? `@(shared|${prefixes.join("|")})`
    : "shared";

  const configs = [
    {
      name: "naming/queries",
      files: featuresGlob(featureRoot, "**/queries/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/queries/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": prefixPattern },
        ],
      },
    },
    {
      name: "naming/queries-shared",
      files: featuresGlob(featureRoot, "shared/queries/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
    {
      name: "naming/queries-export",
      files: featuresGlob(featureRoot, "**/queries/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/queries-export": "error",
      },
    },
    {
      name: "naming/supabase-select",
      files: featuresGlob(featureRoot, "**/queries/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/supabase-select-typed-columns": "error",
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
    {
      name: "imports/queries",
      files: [`${featureRoot}/**/queries/*.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: [...LAYER_PATTERNS, ...LATERAL_PATTERNS, ...MAPPING_PATTERNS] },
        ],
      },
    },
  ];

  for (const prefix of prefixes) {
    const patterns = prefixLibPatterns(prefix, prefixLibMapping);
    if (patterns.length === 0) continue;
    configs.push({
      name: `imports/queries/${prefix}`,
      files: [`${featureRoot}/**/queries/${prefix}.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              ...LAYER_PATTERNS,
              ...LATERAL_PATTERNS,
              ...patterns,
              ...MAPPING_PATTERNS,
            ],
          },
        ],
      },
    });
  }

  return configs;
}
