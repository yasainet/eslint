import { featuresGlob } from "../_internal/constants.mjs";
import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../_internal/import-patterns.mjs";
import { checkFile } from "../_internal/plugins.mjs";

export function createUtilsConfigs({ featureRoot, prefixLibMapping }) {
  const prefixes = Object.keys(prefixLibMapping);
  const hasPrefixes = prefixes.length > 0;
  const sharedPrefixPattern = hasPrefixes
    ? `@(shared|${prefixes.join("|")})`
    : "shared";

  return [
    {
      name: "naming/utils",
      files: featuresGlob(featureRoot, "*/utils/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/utils/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/utils/*.ts": "<1>" },
        ],
      },
    },
    {
      name: "naming/utils-shared",
      files: featuresGlob(featureRoot, "shared/utils/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
    {
      name: "imports/utils",
      files: [`${featureRoot}/**/utils/*.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: [...LIB_BOUNDARY_PATTERNS, ...MAPPING_PATTERNS] },
        ],
      },
    },
  ];
}
