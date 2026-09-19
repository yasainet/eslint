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
    name: "imports/loaders",
    files: ["src/features/*/loaders/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/(?!features/[^/]+/services/)",
              message:
                "loaders can import only services. loaders cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/actions",
    files: ["src/features/*/actions/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/(?!features/[^/]+/services/)",
              message:
                "actions can import only services. actions cannot import other layers.",
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
              regex: "^@/(?!features/[^/]+/actions/)",
              message:
                "hooks can import only actions. hooks cannot import other layers.",
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
  {
    name: "imports/app",
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex:
                "^@/(?!components/|utils/|features/[^/]+/(?:components|loaders)/)",
              message:
                "app can import only @/components, @/utils, feature components and loaders. app cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/schemas",
    files: ["src/features/*/schemas/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/",
              message:
                "schemas cannot import @/. schemas can import only external packages.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/types",
    files: ["src/features/*/types/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/",
              message:
                "types cannot import @/. types can import only external packages.",
            },
          ],
        },
      ],
    },
  },
];
