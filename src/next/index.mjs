import { createEntryPointConfigs } from "../common/entry-points.mjs";
import { createCommonConfigs } from "../common/index.mjs";
import {
  componentsBoundaryConfigs,
  hooksBoundaryConfigs,
  libBoundaryConfigs,
  pageBoundaryConfigs,
  routeBoundaryConfigs,
  sitemapBoundaryConfigs,
} from "../common/imports.mjs";

import { directivesConfigs } from "./directives.mjs";
import { importPathStyleConfigs } from "./imports.mjs";
import { layoutsConfigs } from "./layouts.mjs";
import { namingConfigs } from "./naming.mjs";
import { tailwindcssConfigs } from "./tailwindcss.mjs";

const nextEntryPointConfigs = createEntryPointConfigs(
  ["src/app/**/*.ts", "src/app/**/*.tsx"],
);

export const eslintConfig = [
  {
    name: "rules/ignore-shadcn-ui",
    ignores: ["src/components/shared/ui/*.{ts,tsx}"],
  },
  ...createCommonConfigs("src/features"),
  ...libBoundaryConfigs,
  ...pageBoundaryConfigs,
  ...routeBoundaryConfigs,
  ...sitemapBoundaryConfigs,
  ...hooksBoundaryConfigs,
  ...componentsBoundaryConfigs,
  ...namingConfigs,
  ...directivesConfigs,
  ...importPathStyleConfigs,
  ...layoutsConfigs,
  ...tailwindcssConfigs,
  ...nextEntryPointConfigs,
];
