import { checkFile } from "../../common/_internal/plugins.mjs";

export const hooksLayerConfigs = [
  {
    name: "naming/hooks",
    files: ["src/features/**/hooks/*.ts"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": "use-+([a-z0-9])*(-+([a-z0-9]))" },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    name: "naming/hooks-export",
    files: ["src/features/**/hooks/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ExportNamedDeclaration > FunctionDeclaration[id.name!=/^use[A-Z]/]",
          message:
            "Exported functions in hooks must start with 'use' (e.g., useAuth).",
        },
      ],
    },
  },
];
