import { featuresGlob } from "../_internal/constants.mjs";
import { checkFile } from "../_internal/plugins.mjs";

export function createConstantsConfigs({ featureRoot, prefixLibMapping }) {
  const prefixes = Object.keys(prefixLibMapping);
  const hasPrefixes = prefixes.length > 0;
  const sharedPrefixPattern = hasPrefixes
    ? `@(shared|${prefixes.join("|")})`
    : "shared";

  return [
    {
      name: "naming/constants",
      files: featuresGlob(featureRoot, "*/constants/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/constants/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/constants/*.ts": "<1>" },
        ],
      },
    },
    {
      name: "naming/constants-shared",
      files: featuresGlob(featureRoot, "shared/constants/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
  ];
}
