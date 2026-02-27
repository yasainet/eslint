import { importsConfigs } from "./imports.mjs";
import { jsdocConfigs } from "./jsdoc.mjs";
import { layersConfigs } from "./layers.mjs";
import { namingConfigs } from "./naming.mjs";
import { rulesConfigs } from "./rules.mjs";

export const commonConfigs = [
  ...rulesConfigs,
  ...namingConfigs,
  ...layersConfigs,
  ...importsConfigs,
  ...jsdocConfigs,
];
