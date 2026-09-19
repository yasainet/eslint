import plugin from "./plugin.mjs";

export default [
  {
    name: "directives/actions",
    files: ["src/features/*/actions/*.ts"],
    plugins: { yasainet: plugin },
    rules: {
      "yasainet/directive": [
        "error",
        { layer: "actions", required: "use server" },
      ],
    },
  },
  {
    name: "directives/loaders",
    files: ["src/features/*/loaders/*.ts"],
    plugins: { yasainet: plugin },
    rules: {
      "yasainet/directive": [
        "error",
        {
          layer: "loaders",
          forbidden: { directive: "use server", owner: "actions" },
        },
      ],
    },
  },
  {
    name: "directives/hooks",
    files: ["src/features/*/hooks/*.ts"],
    plugins: { yasainet: plugin },
    rules: {
      "yasainet/directive": [
        "error",
        { layer: "hooks", required: "use client" },
      ],
    },
  },
];
