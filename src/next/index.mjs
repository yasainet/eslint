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
  ...createCommonConfigs("src/features"),
  ...libBoundaryConfigs,
  ...pageBoundaryConfigs,
  ...namingConfigs,
  ...directivesConfigs,
  ...importPathStyleConfigs,
  ...nextEntryPointConfigs,
];
