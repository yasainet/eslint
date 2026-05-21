import { generatePrefixLibMapping } from "./constants.mjs";
import { createImportsConfigs } from "./imports.mjs";
import { createJsdocConfigs } from "./jsdoc.mjs";
import { createLayersConfigs } from "./layers.mjs";
import { createLibNamingConfigs, createNamingConfigs, createUtilsNamingConfigs } from "./naming.mjs";
import { createRulesConfigs } from "./rules.mjs";

export function createCommonConfigs(
  featureRoot,
  { banAliasImports = false, typeAware = true, rulesFiles } = {},
) {
  const prefixLibMapping = generatePrefixLibMapping(featureRoot);
  return [
    ...createRulesConfigs({ typeAware, ...(rulesFiles && { files: rulesFiles }) }),
    ...createNamingConfigs(featureRoot, prefixLibMapping),
    ...createLibNamingConfigs(featureRoot),
    ...createUtilsNamingConfigs(featureRoot),
    ...createLayersConfigs(featureRoot, { typeAware }),
    ...createImportsConfigs(featureRoot, prefixLibMapping, { banAliasImports }),
    ...createJsdocConfigs(featureRoot),
  ];
}
