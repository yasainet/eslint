import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

const ROUTE_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "route.ts は queries を直接 import 不可。entries 経由で使う。",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "route.ts は services を直接 import 不可。entries 経由で使う。",
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
