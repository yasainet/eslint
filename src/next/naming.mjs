import { checkFile } from "../common/plugins.mjs";

export const namingConfigs = [
  {
    name: "naming/hooks",
    files: ["src/features/**/hooks/*.ts"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": "use[A-Z]*([a-zA-Z0-9])" },
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
  {
    name: "naming/components-tsx-only",
    files: ["src/components/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program",
          message:
            "components/ must only contain .tsx files. Logic belongs in src/features/.",
        },
      ],
    },
  },
  {
    name: "naming/components-pascal-case",
    files: ["src/components/**/*.tsx"],
    ignores: ["src/components/shared/ui/**"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.tsx": "PASCAL_CASE" },
      ],
    },
  },
];
