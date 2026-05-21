import { checkFile } from "../../common/_internal/plugins.mjs";

export const componentsLayerConfigs = [
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
