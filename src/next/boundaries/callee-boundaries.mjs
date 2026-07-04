import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../../common/_internal/import-patterns.mjs";

function createCalleeBoundaryConfig({ name, files, surface, via = "entries" }) {
  return {
    name,
    files,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/queries/*", "**/queries"],
              message: `${surface} は queries を直接 import 不可。${via} 経由で使う。`,
            },
            {
              group: ["**/services/*", "**/services"],
              message: `${surface} は services を直接 import 不可。${via} 経由で使う。`,
            },
            ...LIB_BOUNDARY_PATTERNS,
            ...MAPPING_PATTERNS,
          ],
        },
      ],
    },
  };
}

export const calleeBoundaryConfigs = [
  createCalleeBoundaryConfig({
    name: "imports/page-boundary",
    surface: "page.tsx",
    files: ["src/app/**/page.tsx"],
  }),
  createCalleeBoundaryConfig({
    name: "imports/route-boundary",
    surface: "route.ts",
    files: ["src/app/**/route.ts"],
  }),
  createCalleeBoundaryConfig({
    name: "imports/sitemap-boundary",
    surface: "sitemap.ts",
    files: ["src/app/sitemap.ts", "src/app/**/sitemap.ts"],
  }),
  createCalleeBoundaryConfig({
    name: "imports/hooks-boundary",
    surface: "hooks",
    files: ["src/features/**/hooks/*.ts"],
  }),
  createCalleeBoundaryConfig({
    name: "imports/components-boundary",
    surface: "components",
    files: ["src/components/**/*.{ts,tsx}"],
    via: "entries か hooks",
  }),
];
