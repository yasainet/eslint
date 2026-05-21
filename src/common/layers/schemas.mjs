import { featuresGlob } from "../_internal/constants.mjs";
import { checkFile } from "../_internal/plugins.mjs";
import { localPlugin } from "../local-plugins/index.mjs";

export function createSchemasConfigs({ featureRoot, prefixLibMapping }) {
  const prefixes = Object.keys(prefixLibMapping);
  const hasPrefixes = prefixes.length > 0;
  const sharedPrefixPattern = hasPrefixes
    ? `@(shared|${prefixes.join("|")})`
    : "shared";

  return [
    {
      name: "naming/schemas",
      files: featuresGlob(featureRoot, "*/schemas/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/schemas/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/schemas/*.ts": "<1>" },
        ],
      },
    },
    {
      name: "naming/schemas-shared",
      files: featuresGlob(featureRoot, "shared/schemas/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
    {
      name: "naming/schema-naming",
      files: featuresGlob(featureRoot, "**/schemas/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/schema-naming": "error",
      },
    },
  ];
}
