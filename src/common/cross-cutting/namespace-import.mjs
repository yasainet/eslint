import { featuresGlob } from "../_internal/constants.mjs";
import { localPlugin } from "../local-plugins/index.mjs";

export function createNamespaceImportConfigs({ featureRoot }) {
  return [
    {
      name: "naming/namespace-import-name",
      files: featuresGlob(featureRoot, "**/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/namespace-import-name": ["error", { featureRoot }],
      },
    },
    {
      name: "naming/queries-namespace-import",
      files: featuresGlob(featureRoot, "**/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/queries-namespace-import": "error",
      },
    },
  ];
}
