import { createEntryPointConfigs } from "../common/entry-points.mjs";
import { createCommonConfigs } from "../common/index.mjs";
import { libBoundaryConfigs, pageBoundaryConfigs } from "../common/imports.mjs";

import { directivesConfigs } from "./directives.mjs";
import { importPathStyleConfigs } from "./imports.mjs";
import { namingConfigs } from "./naming.mjs";

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
  ...namingConfigs,
  ...directivesConfigs,
  ...importPathStyleConfigs,
  ...nextEntryPointConfigs,
];
