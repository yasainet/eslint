import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  {
    name: "base/imports",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
];
