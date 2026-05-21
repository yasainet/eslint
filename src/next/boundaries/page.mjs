import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

const PAGE_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "page.tsx can only import entries, not queries (page-boundary violation)",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "page.tsx can only import entries, not services (page-boundary violation)",
  },
];

export const pageBoundaryConfigs = [
  {
    name: "imports/page-boundary",
    files: ["src/app/**/page.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...PAGE_BOUNDARY_PATTERNS,
            ...LIB_BOUNDARY_PATTERNS,
            ...MAPPING_PATTERNS,
          ],
        },
      ],
    },
  },
];
