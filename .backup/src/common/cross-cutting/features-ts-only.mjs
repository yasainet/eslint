import { featuresGlob } from "../_internal/constants.mjs";

export function createFeaturesTsOnlyConfigs({ featureRoot }) {
  return [
    {
      name: "naming/features-ts-only",
      files: featuresGlob(featureRoot, "**/*.tsx"),
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "Program",
            message:
              "features/ は .ts のみ。component は src/components/ に置く。",
          },
        ],
      },
    },
  ];
}
