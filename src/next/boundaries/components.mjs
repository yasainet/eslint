import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

const COMPONENTS_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "components は queries を直接 import 不可。entries か hooks 経由で使う。",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "components は services を直接 import 不可。entries か hooks 経由で使う。",
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
