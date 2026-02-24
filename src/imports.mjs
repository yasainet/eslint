/**
 * @fileoverview Import restrictions for repository files.
 *
 * Enforces that each {prefix}.repo.ts can only import its corresponding lib:
 * - server.repo.ts → @/lib/supabase/server only
 * - client.repo.ts → @/lib/supabase/client only
 *
 * This prevents mixing different data sources in a single repository file.
 */

import { PREFIX_LIB_MAPPING } from "./constants.mjs";

/**
 * Generate import restriction configs for each prefix.
 *
 * For each prefix (e.g., "server"), creates a rule that forbids importing
 * any other lib from PREFIX_LIB_MAPPING.
 *
 * @returns {import("eslint").Linter.Config[]}
 */
function generateImportConfigs() {
  const prefixes = Object.keys(PREFIX_LIB_MAPPING);
  const configs = [];

  for (const prefix of prefixes) {
    const allowedLib = PREFIX_LIB_MAPPING[prefix];
    const forbiddenLibs = prefixes
      .filter((p) => p !== prefix)
      .map((p) => PREFIX_LIB_MAPPING[p]);

    // Skip if no forbidden libs (shouldn't happen, but safety check)
    if (forbiddenLibs.length === 0) continue;

    configs.push({
      name: `imports/${prefix}-repo`,
      files: [`**/repositories/${prefix}.repo.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: forbiddenLibs.map((lib) => ({
              group: [`${lib}`, `${lib}/*`],
              message: `${prefix}.repo.ts can only import from ${allowedLib}. Use the correct repository file for this lib.`,
            })),
          },
        ],
      },
    });
  }

  return configs;
}

/**
 * Import restriction configurations for repository files.
 * @type {import("eslint").Linter.Config[]}
 */
export const importsConfigs = generateImportConfigs();
