export default [
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
