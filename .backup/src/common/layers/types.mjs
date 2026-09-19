import { featuresGlob } from "../_internal/constants.mjs";
import { MAPPING_PATTERNS } from "../_internal/import-patterns.mjs";
import { checkFile } from "../_internal/plugins.mjs";

export function createTypesConfigs({ featureRoot, prefixLibMapping }) {
  const prefixes = Object.keys(prefixLibMapping);
  const hasPrefixes = prefixes.length > 0;
  const sharedPrefixPattern = hasPrefixes
    ? `@(shared|${prefixes.join("|")})`
    : "shared";

  return [
    {
      name: "naming/types",
      files: featuresGlob(featureRoot, "*/types/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/types/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/types/*.ts": "<1>" },
        ],
      },
    },
    {
      name: "naming/types-shared",
      files: featuresGlob(featureRoot, "shared/types/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
    {
      name: "imports/feature-types",
      files: [`${featureRoot}/**/types/*.ts`],
      rules: {
        "no-restricted-imports": ["error", { patterns: MAPPING_PATTERNS }],
      },
    },
  ];
}
