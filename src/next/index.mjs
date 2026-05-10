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

/** Next.js ESLint flat config entry point. */
export const eslintConfig = [
  // shadcn/ui generated components live directly under `src/components/shared/ui/`.
  // Files in `custom/` are user-authored and remain linted.
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
