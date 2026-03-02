import { localPlugin } from "../common/local-plugins/index.mjs";

/** Enforce relative paths within same feature, @/ for cross-feature in Next.js. */
export const importPathStyleConfigs = [
  {
    name: "imports/path-style",
    files: ["src/features/**/*.ts"],
    plugins: { local: localPlugin },
    rules: {
      "local/import-path-style": [
        "error",
        { featureRoot: "src/features" },
      ],
    },
  },
];
