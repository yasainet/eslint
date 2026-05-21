import { localPlugin } from "../common/local-plugins/index.mjs";

export const layoutsConfigs = [
  {
    name: "layouts/main-structural-only",
    files: ["src/app/**/layout.tsx"],
    plugins: { local: localPlugin },
    rules: {
      "local/layout-main-structural-only": "error",
    },
  },
];
