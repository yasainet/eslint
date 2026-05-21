import { createEntryPointConfigs } from "../common/boundaries/entry-point.mjs";
import { createCommonConfigs } from "../common/index.mjs";

import { componentsBoundaryConfigs } from "./boundaries/components.mjs";
import { hooksBoundaryConfigs } from "./boundaries/hooks.mjs";
import { libBoundaryConfigs } from "./boundaries/lib.mjs";
import { pageBoundaryConfigs } from "./boundaries/page.mjs";
import { routeBoundaryConfigs } from "./boundaries/route.mjs";
import { sitemapBoundaryConfigs } from "./boundaries/sitemap.mjs";
import { directivesConfigs } from "./directives.mjs";
import { importPathStyleConfigs } from "./imports.mjs";
import { componentsLayerConfigs } from "./layers/components.mjs";
import { hooksLayerConfigs } from "./layers/hooks.mjs";
import { layoutsConfigs } from "./layers/layouts.mjs";
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
  ...hooksLayerConfigs,
  ...componentsLayerConfigs,
  ...directivesConfigs,
  ...importPathStyleConfigs,
  ...layoutsConfigs,
  ...tailwindcssConfigs,
  ...nextEntryPointConfigs,
];
