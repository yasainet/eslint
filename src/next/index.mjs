import { createCommonConfigs } from "../common/index.mjs";
import { libBoundaryConfigs } from "../common/imports.mjs";

import { directivesConfigs } from "./directives.mjs";
import { importPathStyleConfigs } from "./imports.mjs";
import { namingConfigs } from "./naming.mjs";

/** Next.js ESLint flat config entry point. */
export const eslintConfig = [
  ...createCommonConfigs("src/features"),
  ...libBoundaryConfigs,
  ...namingConfigs,
  ...directivesConfigs,
  ...importPathStyleConfigs,
];
