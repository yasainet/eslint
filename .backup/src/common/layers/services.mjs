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
    message: "services は entries を import 不可。依存は単方向に保つ。",
  },
  {
    group: ["**/hooks/*", "**/hooks"],
    message: "services は hooks を import 不可。依存は単方向に保つ。",
  },
];

const LATERAL_PATTERNS = [
  {
    group: ["@/features/*/services/*", "@/features/*/services"],
    message:
      "他 feature の services は import 不可。feature を跨ぐ依存は禁止。",
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
      ignores: [
        ...featuresGlob(featureRoot, "shared/services/*.ts"),
        "**/*.test.ts",
      ],
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
      ignores: ["**/*.test.ts"],
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
              "services で try-catch は禁止。エラー処理は entries に集約する。",
          },
          {
            selector: "ThrowStatement",
            message:
              "services で throw は禁止。失敗は値で返す:\n" +
              "- `T | null` / `{ data, error }` / 空デフォルトのいずれか\n" +
              "- lib の native 例外は entry の catch に自動伝播する",
          },
          { selector: loggerSelector, message: loggerMessage },
          {
            selector:
              "LogicalExpression[operator='??'][left.type='ChainExpression'][left.expression.property.name='message'][right.type='Literal']",
            message:
              "error message の dead fallback。この分岐に来た時点で error は既知 — error をそのまま返す。",
          },
          {
            selector:
              "LogicalExpression[operator='??'][left.type='MemberExpression'][left.property.name='error'][right.type='ObjectExpression']",
            message:
              "nullable error の dead fallback。`if (error)` で判定し error をそのまま返す。",
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
