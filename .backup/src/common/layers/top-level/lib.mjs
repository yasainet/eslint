import {
  LIB_OUTBOUND_PATTERNS,
  LIB_UTILS_PURITY_PATTERNS,
} from "../../_internal/import-patterns.mjs";
import { checkFile } from "../../_internal/plugins.mjs";

export function createTopLevelLibConfigs({ featureRoot }) {
  const libRoot = featureRoot.replace(/features$/, "lib");
  return [
    {
      name: "naming/top-level-lib",
      files: [`${libRoot}/**/*.ts`],
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": "*" },
        ],
      },
    },
    {
      name: "imports/top-level-lib",
      files: [`${libRoot}/**/*.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: LIB_OUTBOUND_PATTERNS },
        ],
      },
    },
    {
      name: "imports/top-level-lib-utils",
      files: [`${libRoot}/**/utils.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: LIB_UTILS_PURITY_PATTERNS },
        ],
      },
    },
  ];
}
