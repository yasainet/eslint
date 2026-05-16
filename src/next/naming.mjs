import { checkFile } from "../common/plugins.mjs";

/** Next.js-specific naming convention configs for hooks and components. */
export const namingConfigs = [
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
    // index.tsx は directory entry の慣例として PASCAL_CASE 強制から外す。
    // 例: components/shared/layouts/Header/index.tsx
    ignores: ["src/components/shared/ui/**", "src/components/**/index.tsx"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.tsx": "PASCAL_CASE" },
      ],
    },
  },
];
