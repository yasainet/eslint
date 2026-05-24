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
    message: "queries は services を import 不可。ロジックは services へ。",
  },
  {
    group: ["**/entries/*", "**/entries"],
    message: "queries は entries を import 不可。依存は単方向に保つ。",
  },
  {
    group: ["**/hooks/*", "**/hooks"],
    message: "queries は hooks を import 不可。依存は単方向に保つ。",
  },
];

const LATERAL_PATTERNS = [
  {
    group: ["@/features/*/queries/*", "@/features/*/queries"],
    message:
      "他 feature の queries は import 不可。feature を跨ぐ依存は禁止。",
  },
];

function prefixLibPatterns(prefix, mapping) {
  const prefixes = Object.keys(mapping);
  const allowedLib = mapping[prefix];
  return prefixes
    .filter((p) => p !== prefix)
    .map((p) => ({
      group: [`**/lib/${mapping[p]}`, `**/lib/${mapping[p]}/*`],
      message: `queries/${prefix}.ts は lib/${allowedLib} のみ import 可。lib ごとに対応する query file を使う。`,
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
              "queries では try-catch 禁止。エラーは `{ data, error }` で返す。",
          },
          {
            selector: "IfStatement",
            message:
              "queries で if 文は禁止。条件分岐は services に置く。",
          },
          {
            selector: "ForStatement",
            message:
              "queries でループは禁止。queries は薄い CRUD ラッパー、反復は services に置く。",
          },
          {
            selector: "ForOfStatement",
            message:
              "queries でループは禁止。queries は薄い CRUD ラッパー、反復は services に置く。",
          },
          {
            selector: "ForInStatement",
            message:
              "queries でループは禁止。queries は薄い CRUD ラッパー、反復は services に置く。",
          },
          {
            selector: "WhileStatement",
            message:
              "queries でループは禁止。queries は薄い CRUD ラッパー、反復は services に置く。",
          },
          {
            selector: "DoWhileStatement",
            message:
              "queries でループは禁止。queries は薄い CRUD ラッパー、反復は services に置く。",
          },
          {
            selector: "ThrowStatement",
            message:
              "queries で throw は禁止。Supabase の `{ data, error }` をそのまま返す。",
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
