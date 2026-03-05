import { generatePrefixLibMapping } from "./constants.mjs";
import { createImportsConfigs } from "./imports.mjs";
import { createJsdocConfigs } from "./jsdoc.mjs";
import { createLayersConfigs } from "./layers.mjs";
import { createLibNamingConfigs, createNamingConfigs, createUtilsNamingConfigs } from "./naming.mjs";
import { rulesConfigs } from "./rules.mjs";

/** Build common configs scoped to the given feature root. */
export function createCommonConfigs(
  featureRoot,
  { banAliasImports = false } = {},
) {
  const prefixLibMapping = generatePrefixLibMapping(featureRoot);
  return [
    ...rulesConfigs,
    ...createNamingConfigs(featureRoot, prefixLibMapping),
    ...createLibNamingConfigs(featureRoot),
    ...createUtilsNamingConfigs(featureRoot),
    ...createLayersConfigs(featureRoot),
    ...createImportsConfigs(featureRoot, prefixLibMapping, { banAliasImports }),
    ...createJsdocConfigs(featureRoot),
  ];
}
