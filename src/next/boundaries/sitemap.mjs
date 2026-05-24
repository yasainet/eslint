import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

const SITEMAP_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "sitemap.ts は queries を直接 import 不可。entries 経由で使う。",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "sitemap.ts は services を直接 import 不可。entries 経由で使う。",
  },
];

export const sitemapBoundaryConfigs = [
  {
    name: "imports/sitemap-boundary",
    files: ["src/app/sitemap.ts", "src/app/**/sitemap.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...SITEMAP_BOUNDARY_PATTERNS,
            ...LIB_BOUNDARY_PATTERNS,
            ...MAPPING_PATTERNS,
          ],
        },
      ],
    },
  },
];
