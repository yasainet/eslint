import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

const PAGE_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "page.tsx は queries を直接 import 不可。entries 経由で使う。",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "page.tsx は services を直接 import 不可。entries 経由で使う。",
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
