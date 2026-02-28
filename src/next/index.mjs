import { createCommonConfigs } from "../common/index.mjs";
import { libBoundaryConfigs } from "../common/imports.mjs";

import { directivesConfigs } from "./directives.mjs";
import { namingConfigs } from "./naming.mjs";

export const eslintConfig = [
  ...createCommonConfigs("src/features"),
  ...libBoundaryConfigs,
  ...namingConfigs,
  ...directivesConfigs,
];
