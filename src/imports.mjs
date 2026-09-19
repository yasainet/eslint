import plugin from "./plugin.mjs";

export default [
  {
    name: "imports/path",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { yasainet: plugin },
    rules: {
      "yasainet/no-parent-import": "error",
      "yasainet/namespace-import-name": "error",
    },
  },
  {
    name: "imports/lib",
    files: ["src/lib/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/",
              message:
                "lib can import only ./ (same folder). lib cannot import @/.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/queries",
    files: ["src/features/*/queries/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/(?!lib/)",
              message:
                "queries can import only @/lib. queries cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
];
