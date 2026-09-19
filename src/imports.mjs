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
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/(?!lib/|utils/)",
              message:
                "lib can import only @/lib and @/utils. lib cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
];
