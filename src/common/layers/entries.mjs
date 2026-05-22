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
    message: "entries cannot import queries (layer violation)",
  },
  {
    group: ["**/hooks/*", "**/hooks"],
    message: "entries cannot import hooks (layer violation)",
  },
];

const LATERAL_PATTERNS = [
  {
    group: ["@/features/*/entries/*", "@/features/*/entries"],
    message:
      "entries cannot import other feature's entries (lateral violation)",
  },
  {
    group: [
      "@/features/*/services/*",
      "@/features/*/services",
      "!@/features/shared/services/*",
      "!@/features/shared/services",
    ],
    message:
      "entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).",
  },
];

/**
 * supabase の execution context を跨ぐ import を防ぐ cardinality 制約:
 *
 * - entries/<context>.ts は同名 services/<context> のみ呼べる
 * - 防ぐ runtime 問題:
 *   - entries/server.ts が services/client.ts を呼ぶ
 *   - server context で lib/supabase/client を呼ぶ
 * - server / client / admin は supabase 固有
 * - 他 lib (r2 / stripe 等) は対象外
 */
const CARDINALITY_PATTERNS = {
  server: [
    {
      group: ["**/services/client", "**/services/admin"],
      message:
        "server entry can only import server service (cardinality violation)",
    },
  ],
  client: [
    {
      group: ["**/services/server", "**/services/admin"],
      message:
        "client entry can only import client service (cardinality violation)",
    },
  ],
  admin: [
    {
      group: ["**/services/server", "**/services/client"],
      message:
        "admin entry can only import admin service (cardinality violation)",
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
