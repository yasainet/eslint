import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

const HOOKS_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "hooks can only import entries, not queries (hooks-boundary violation)",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "hooks can only import entries, not services (hooks-boundary violation)",
  },
];

export const hooksBoundaryConfigs = [
  {
    name: "imports/hooks-boundary",
    files: ["src/features/**/hooks/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...HOOKS_BOUNDARY_PATTERNS,
            ...LIB_BOUNDARY_PATTERNS,
            ...MAPPING_PATTERNS,
          ],
        },
      ],
    },
  },
];
