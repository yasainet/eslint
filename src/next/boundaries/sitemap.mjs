import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

const SITEMAP_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "sitemap.ts can only import entries, not queries (sitemap-boundary violation)",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "sitemap.ts can only import entries, not services (sitemap-boundary violation)",
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
