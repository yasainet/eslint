import { checkFile } from "../_internal/plugins.mjs";

export function createLibLayerConfigs({ featureRoot }) {
  const libRoot = featureRoot.replace(/features$/, "lib");
  return [
    {
      name: "naming/lib",
      files: [`${libRoot}/**/*.ts`],
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
