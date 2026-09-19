import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

export const libBoundaryConfigs = [
  {
    name: "imports/lib-boundary",
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/lib/**",
      "src/proxy.ts",
      "src/app/**/route.ts",
      "src/features/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [...LIB_BOUNDARY_PATTERNS, ...MAPPING_PATTERNS] },
      ],
    },
  },
];
