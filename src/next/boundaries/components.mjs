import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

const COMPONENTS_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "components can only import entries or hooks, not queries (components-boundary violation)",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "components can only import entries or hooks, not services (components-boundary violation)",
  },
];

export const componentsBoundaryConfigs = [
  {
    name: "imports/components-boundary",
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...COMPONENTS_BOUNDARY_PATTERNS,
            ...LIB_BOUNDARY_PATTERNS,
            ...MAPPING_PATTERNS,
          ],
        },
      ],
    },
  },
];
