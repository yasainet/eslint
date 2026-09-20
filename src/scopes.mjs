import plugin from "./plugin.mjs";

export default [
  {
    name: "scopes/features",
    files: ["src/features/*/{services,loaders,actions,hooks}/*.ts"],
    plugins: { yasainet: plugin },
    rules: {
      "yasainet/scope": "error",
    },
  },
];
