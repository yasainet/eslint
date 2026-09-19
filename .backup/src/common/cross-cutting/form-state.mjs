import { featuresGlob } from "../_internal/constants.mjs";
import { localPlugin } from "../local-plugins/index.mjs";

export function createFormStateConfigs({ featureRoot }) {
  return [
    {
      name: "naming/form-state",
      files: featuresGlob(featureRoot, "**/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/form-state-naming": "error",
        "local/form-state-shape": "error",
      },
    },
  ];
}
