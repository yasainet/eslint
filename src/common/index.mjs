import { generatePrefixLibMapping } from "./constants.mjs";
import { createImportsConfigs } from "./imports.mjs";
import { createJsdocConfigs } from "./jsdoc.mjs";
import { createLayersConfigs } from "./layers.mjs";
import { createNamingConfigs } from "./naming.mjs";
import { rulesConfigs } from "./rules.mjs";

/** @description Build common configs scoped to the given feature root */
export function createCommonConfigs(featureRoot) {
  const prefixLibMapping = generatePrefixLibMapping(featureRoot);
  return [
    ...rulesConfigs,
    ...createNamingConfigs(featureRoot, prefixLibMapping),
    ...createLayersConfigs(featureRoot),
    ...createImportsConfigs(featureRoot, prefixLibMapping),
    ...createJsdocConfigs(featureRoot),
  ];
}
