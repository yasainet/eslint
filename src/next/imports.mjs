import { localPlugin } from "../common/local-plugins/index.mjs";

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
