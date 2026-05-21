import { featuresGlob } from "../_internal/constants.mjs";
import { localPlugin } from "../local-plugins/index.mjs";

export function createSupabaseColumnsSatisfiesConfigs({ featureRoot }) {
  return [
    {
      name: "naming/supabase-columns-satisfies",
      files: [
        ...featuresGlob(featureRoot, "**/queries/*.ts"),
        ...featuresGlob(featureRoot, "**/constants/*.ts"),
      ],
      plugins: { local: localPlugin },
      rules: {
        "local/supabase-columns-satisfies": "error",
      },
    },
  ];
}
