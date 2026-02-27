/**
 * @fileoverview Next.js-specific file naming conventions.
 *
 * Enforces:
 * - hooks: useXxx.ts (e.g., useAuth.ts)
 * - components/**: .tsx only (no .ts — logic belongs in src/features/)
 * - components/*.tsx: PascalCase (e.g., Button.tsx, AlertDialog.tsx)
 *   - components/shared/ui/ excluded (shadcn/ui uses kebab-case)
 */

import { featuresGlob } from "../common/constants.mjs";
import { checkFile } from "../common/plugins.mjs";

/**
 * Next.js-specific naming convention configurations.
 * @type {import("eslint").Linter.Config[]}
 */
export const namingConfigs = [
  {
    name: "naming/hooks",
    files: featuresGlob("**/hooks/*.ts"),
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
