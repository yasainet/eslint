import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

const ROUTE_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "route.ts can only import entries, not queries (route-boundary violation)",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "route.ts can only import entries, not services (route-boundary violation)",
  },
];

export const routeBoundaryConfigs = [
  {
    name: "imports/route-boundary",
    files: ["src/app/**/route.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...ROUTE_BOUNDARY_PATTERNS,
            ...LIB_BOUNDARY_PATTERNS,
            ...MAPPING_PATTERNS,
          ],
        },
      ],
    },
  },
];
