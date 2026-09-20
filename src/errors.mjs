import plugin from "./plugin.mjs";

export default [
  {
    name: "errors/features",
    files: ["src/features/**/*.{ts,tsx}"],
    plugins: { yasainet: plugin },
    rules: {
      "yasainet/no-try-catch": "error",
    },
  },
];
