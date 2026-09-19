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
  {
    name: "imports/services",
    files: ["src/features/*/services/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/(?!features/[^/]+/(queries|schemas|types)/)",
              message:
                "services can import only queries, schemas and types. services cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/entries",
    files: ["src/features/*/entries/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/(?!features/[^/]+/services/)",
              message:
                "entries can import only services. entries cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/hooks",
    files: ["src/features/*/hooks/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/(?!features/[^/]+/entries/)",
              message:
                "hooks can import only entries. hooks cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/feature-components",
    files: ["src/features/*/components/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/(?!components/|features/[^/]+/hooks/)",
              message:
                "feature components can import only @/components and hooks. feature components cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
];
