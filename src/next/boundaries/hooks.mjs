import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

const HOOKS_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "hooks は queries を直接 import 不可。entries 経由で使う。",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "hooks は services を直接 import 不可。entries 経由で使う。",
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
