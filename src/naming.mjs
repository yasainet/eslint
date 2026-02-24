/**
 * @fileoverview File naming conventions for feature modules.
 *
 * Enforces consistent naming patterns:
 * - domains: {prefix}.domain.ts (e.g., server.domain.ts, stripe.domain.ts)
 * - repositories: {prefix}.repo.ts (e.g., server.repo.ts, stripe.repo.ts)
 * - actions: {prefix}.action.ts (e.g., server.action.ts, stripe.action.ts)
 * - hooks: useXxx.ts (e.g., useAuth.ts)
 * - types: xxx.type.ts (e.g., comic.type.ts)
 * - schemas: xxx.schema.ts (e.g., comic.schema.ts)
 * - utils: xxx.util.ts (e.g., format.util.ts)
 * - constants: xxx.constant.ts (e.g., api.constant.ts)
 *
 * Extension constraints:
 * - features/**: .ts only (no .tsx — components belong in src/components/)
 * - components/**:  .tsx only (no .ts — logic belongs in src/features/)
 *
 * Component naming:
 * - components/ *.tsx: PascalCase (e.g., Button.tsx, AlertDialog.tsx)
 * - components/shared/ui/ : excluded (shadcn/ui uses kebab-case)
 *
 * Valid prefixes are defined in PREFIX_LIB_MAPPING (constants.mjs).
 */

import { featuresGlob, PREFIX_LIB_MAPPING } from "./constants.mjs";
import { checkFile } from "./plugins.mjs";

/**
 * Generate glob pattern from PREFIX_LIB_MAPPING keys.
 * @example "@(server|client|admin)"
 */
const prefixPattern = `@(${Object.keys(PREFIX_LIB_MAPPING).join("|")})`;

/**
 * File naming convention configurations.
 * @type {import("eslint").Linter.Config[]}
 */
export const namingConfigs = [
  {
    name: "naming/domains",
    files: featuresGlob("**/domains/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": `${prefixPattern}.domain` },
      ],
    },
  },
  {
    name: "naming/repositories",
    files: featuresGlob("**/repositories/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": `${prefixPattern}.repo` },
      ],
    },
  },
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
    name: "naming/types",
    files: featuresGlob("**/types/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": "+([a-z0-9-]).type" },
      ],
    },
  },
  {
    name: "naming/schemas",
    files: featuresGlob("**/schemas/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": "+([a-z0-9-]).schema" },
      ],
    },
  },
  {
    name: "naming/utils",
    files: featuresGlob("**/util/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": "+([a-z0-9-]).util" },
      ],
    },
  },
  {
    name: "naming/constants",
    files: featuresGlob("**/constants/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": "+([a-z0-9-]).constant" },
      ],
    },
  },
  {
    name: "naming/actions",
    files: featuresGlob("**/actions/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": `${prefixPattern}.action` },
      ],
    },
  },
  {
    name: "naming/features-ts-only",
    files: featuresGlob("**/*.tsx"),
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program",
          message:
            "features/ must only contain .ts files. Components belong in src/components/.",
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
