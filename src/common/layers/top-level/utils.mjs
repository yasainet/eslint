import { checkFile } from "../../_internal/plugins.mjs";

export function createTopLevelUtilsConfigs({ featureRoot }) {
  const utilsRoot = featureRoot.replace(/features$/, "utils");
  return [
    {
      name: "naming/top-level-utils",
      files: [`${utilsRoot}/**/*.ts`],
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": "*" },
        ],
      },
    },
  ];
}
