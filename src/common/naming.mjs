/**
 * @fileoverview Common file naming conventions for feature modules.
 *
 * Enforces consistent naming patterns:
 * - services: {prefix}.service.ts (e.g., server.service.ts, stripe.service.ts)
 * - repositories: {prefix}.repo.ts (e.g., server.repo.ts, stripe.repo.ts)
 * - actions: {prefix}.action.ts (e.g., server.action.ts, stripe.action.ts)
 * - types: {feature}.type.ts (e.g., threads.type.ts) — shared: free naming
 * - schemas: xxx.schema.ts (e.g., comic.schema.ts)
 * - utils: {feature}.utils.ts (e.g., threads.utils.ts) — shared: free naming
 * - constants: xxx.constant.ts (e.g., api.constant.ts)
 *
 * Extension constraint:
 * - features/**: .ts only (no .tsx — components belong in src/components/)
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
 * Common file naming convention configurations.
 * @type {import("eslint").Linter.Config[]}
 */
export const namingConfigs = [
  {
    name: "naming/services",
    files: featuresGlob("**/services/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": `${prefixPattern}.service` },
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
    name: "naming/types",
    files: featuresGlob("*/types/*.type.ts"),
    ignores: featuresGlob("shared/types/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*/types/*.ts": "<1>" },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    name: "naming/types-shared",
    files: featuresGlob("shared/types/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": "+([a-z0-9_-]).type" },
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
    files: featuresGlob("*/utils/*.utils.ts"),
    ignores: featuresGlob("shared/utils/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*/utils/*.ts": "<1>" },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    name: "naming/utils-shared",
    files: featuresGlob("shared/utils/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": "+([a-z0-9_-]).utils" },
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
];
