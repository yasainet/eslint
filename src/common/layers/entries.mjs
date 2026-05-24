import { featuresGlob } from "../_internal/constants.mjs";
import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../_internal/import-patterns.mjs";
import { checkFile } from "../_internal/plugins.mjs";
import {
  aliasDynamicImportMessage,
  aliasDynamicImportSelector,
} from "../_internal/selectors.mjs";
import { localPlugin } from "../local-plugins/index.mjs";

const LAYER_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "entries は queries を import 不可。queries は service 経由で使う。",
  },
  {
    group: ["**/hooks/*", "**/hooks"],
    message: "entries は hooks を import 不可。依存は単方向に保つ。",
  },
];

const LATERAL_PATTERNS = [
  {
    group: ["@/features/*/entries/*", "@/features/*/entries"],
    message: "他 feature の entries は import 不可。feature を跨ぐ依存は禁止。",
  },
  {
    group: [
      "@/features/*/services/*",
      "@/features/*/services",
      "!@/features/shared/services/*",
      "!@/features/shared/services",
    ],
    message:
      "他 feature の services は import 不可:\n" +
      "- 同一 feature の service を 1:1 で使うか、orchestration を service 層へ移す\n" +
      "- `shared/services/*` は横断的な副作用 (通知等) のため例外",
  },
];

const CARDINALITY_PATTERNS = {
  server: [
    {
      group: ["**/services/client", "**/services/admin"],
      message:
        "server entry は server service のみ import 可。context を跨ぐ呼び出しは禁止。",
    },
  ],
  client: [
    {
      group: ["**/services/server", "**/services/admin"],
      message:
        "client entry は client service のみ import 可。context を跨ぐ呼び出しは禁止。",
    },
  ],
  admin: [
    {
      group: ["**/services/server", "**/services/client"],
      message:
        "admin entry は admin service のみ import 可。context を跨ぐ呼び出しは禁止。",
    },
  ],
};

export function createEntriesConfigs({ featureRoot, prefixLibMapping }) {
  const prefixes = Object.keys(prefixLibMapping);
  const hasPrefixes = prefixes.length > 0;
  const prefixPattern = hasPrefixes ? `@(${prefixes.join("|")})` : "*";
  const sharedPrefixPattern = hasPrefixes
    ? `@(shared|${prefixes.join("|")})`
    : "shared";

  const configs = [
    {
      name: "naming/entries",
      files: featuresGlob(featureRoot, "**/entries/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/entries/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": prefixPattern },
        ],
      },
    },
    {
      name: "naming/entries-shared",
      files: featuresGlob(featureRoot, "shared/entries/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
    {
      name: "naming/entry-template",
      files: featuresGlob(featureRoot, "**/entries/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/entry-template": "error",
      },
    },
    {
      name: "naming/entry-single-service-call",
      files: featuresGlob(featureRoot, "**/entries/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/entry-single-service-call": "error",
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
    {
      name: "imports/entries",
      files: [`${featureRoot}/**/entries/*.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              ...LAYER_PATTERNS,
              ...LATERAL_PATTERNS,
              ...LIB_BOUNDARY_PATTERNS,
              ...MAPPING_PATTERNS,
            ],
          },
        ],
      },
    },
  ];

  for (const prefix of ["server", "client", "admin"]) {
    configs.push({
      name: `imports/entries/${prefix}`,
      files: [`${featureRoot}/**/entries/${prefix}.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              ...LAYER_PATTERNS,
              ...LATERAL_PATTERNS,
              ...CARDINALITY_PATTERNS[prefix],
              ...LIB_BOUNDARY_PATTERNS,
              ...MAPPING_PATTERNS,
            ],
          },
        ],
      },
    });
  }

  return configs;
}
