import { commonConfigs } from "../common/index.mjs";

import { directivesConfigs } from "./directives.mjs";
import { namingConfigs } from "./naming.mjs";

export const eslintConfig = [
  ...commonConfigs,
  ...namingConfigs,
  ...directivesConfigs,
];
