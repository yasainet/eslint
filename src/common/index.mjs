import { createImportsConfigs } from "./imports.mjs";
import { createJsdocConfigs } from "./jsdoc.mjs";
import { createLayersConfigs } from "./layers.mjs";
import { createNamingConfigs } from "./naming.mjs";
import { rulesConfigs } from "./rules.mjs";

/** @description Build common configs scoped to the given feature root */
export function createCommonConfigs(featureRoot) {
  return [
    ...rulesConfigs,
    ...createNamingConfigs(featureRoot),
    ...createLayersConfigs(featureRoot),
    ...createImportsConfigs(featureRoot),
    ...createJsdocConfigs(featureRoot),
  ];
}
