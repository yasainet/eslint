import checkFile from "eslint-plugin-check-file";

import plugin from "./plugin.mjs";

export default [
  {
    name: "naming/filename",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "src/**/*.{ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    name: "naming/folder",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/!(app)/**/": "KEBAB_CASE",
          "src/app/**/": "NEXT_JS_APP_ROUTER_CASE",
        },
      ],
    },
  },
  {
    name: "naming/feature",
    files: ["src/features/**/*.{ts,tsx}"],
    plugins: { yasainet: plugin },
    rules: {
      "yasainet/feature-name": "error",
    },
  },
];
