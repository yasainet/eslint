import { featuresGlob } from "../_internal/constants.mjs";
import { localPlugin } from "../local-plugins/index.mjs";

export function createFeatureNameConfigs({ featureRoot }) {
  return [
    {
      name: "naming/feature-name",
      files: featuresGlob(featureRoot, "**/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/feature-name": ["error", { featureRoot }],
      },
    },
  ];
}
