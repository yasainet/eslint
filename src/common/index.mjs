import { generatePrefixLibMapping } from "./constants.mjs";
import { createImportsConfigs } from "./imports.mjs";
import { createJsdocConfigs } from "./jsdoc.mjs";
import { createLayersConfigs } from "./layers.mjs";
import { createLibNamingConfigs, createNamingConfigs, createUtilsNamingConfigs } from "./naming.mjs";
import { createRulesConfigs } from "./rules.mjs";

/**
 * Build common configs scoped to the given feature root:
 *
 * - `banAliasImports: true` enforces relative imports inside the feature root
 * - `typeAware: false` disables type-aware rules and `local/no-any-return`,
 *   for environments without a project tsconfig (e.g., Deno entry)
 * - `rulesFiles` narrows the parser/rules block. Pass when combining multiple
 *   entries so each entry only overrides its own files (e.g., the deno entry
 *   passes `["supabase/functions/**\/*.ts"]` so it doesn't override next's
 *   parser settings on `src/`).
 */
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
