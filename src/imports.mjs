/**
 * @fileoverview Consolidated import restrictions.
 *
 * Merges all `no-restricted-imports` rules into a single source to avoid
 * the ESLint flat-config "last wins" override bug.
 *
 * Pattern categories:
 * 1. Layer: upper-layer imports forbidden (repos < domain < actions < hooks)
 * 2. Cross-feature: same-layer cross-feature imports forbidden
 * 3. Cardinality: action → domain 1:1 prefix match
 * 4. Prefix-lib: repo → lib 1:1 prefix match
 * 5. Lib-boundary: @/lib/* only importable from repositories
 */

import { PREFIX_LIB_MAPPING } from "./constants.mjs";

// ---------------------------------------------------------------------------
// 1. Layer patterns
// ---------------------------------------------------------------------------

const LAYER_PATTERNS = {
  repositories: [
    {
      group: ["*/domain/*", "*/domain"],
      message: "repositories cannot import domain (layer violation)",
    },
    {
      group: ["*/actions/*", "*/actions"],
      message: "repositories cannot import actions (layer violation)",
    },
    {
      group: ["*/hooks/*", "*/hooks"],
      message: "repositories cannot import hooks (layer violation)",
    },
  ],
  domain: [
    {
      group: ["*/actions/*", "*/actions"],
      message: "domain cannot import actions (layer violation)",
    },
    {
      group: ["*/hooks/*", "*/hooks"],
      message: "domain cannot import hooks (layer violation)",
    },
  ],
  actions: [
    {
      group: ["*/hooks/*", "*/hooks"],
      message: "actions cannot import hooks (layer violation)",
    },
  ],
};

// ---------------------------------------------------------------------------
// 2. Cross-feature patterns
// ---------------------------------------------------------------------------

const CROSS_FEATURE_PATTERNS = {
  repositories: [
    {
      group: ["@/features/*/repositories/*", "@/features/*/repositories"],
      message:
        "repositories cannot import other feature's repositories (cross-feature violation)",
    },
  ],
  domain: [
    {
      group: ["@/features/*/domain/*", "@/features/*/domain"],
      message:
        "domain cannot import other feature's domain (cross-feature violation)",
    },
  ],
  actions: [
    {
      group: ["@/features/*/actions/*", "@/features/*/actions"],
      message:
        "actions cannot import other feature's actions (cross-feature violation)",
    },
  ],
};

// ---------------------------------------------------------------------------
// 3. Cardinality patterns
// ---------------------------------------------------------------------------

const CARDINALITY_PATTERNS = {
  server: [
    {
      group: ["**/domain/client.domain*", "**/domain/admin.domain*"],
      message:
        "server.action can only import server.domain (cardinality violation)",
    },
  ],
  client: [
    {
      group: ["**/domain/server.domain*", "**/domain/admin.domain*"],
      message:
        "client.action can only import client.domain (cardinality violation)",
    },
  ],
  admin: [
    {
      group: ["**/domain/server.domain*", "**/domain/client.domain*"],
      message:
        "admin.action can only import admin.domain (cardinality violation)",
    },
  ],
};

// ---------------------------------------------------------------------------
// 4. Prefix-lib pattern generator
// ---------------------------------------------------------------------------

/**
 * Generate forbidden lib patterns for a given prefix.
 *
 * @param {string} prefix
 * @returns {import("eslint").Linter.RuleEntry[]}
 */
function prefixLibPatterns(prefix) {
  const prefixes = Object.keys(PREFIX_LIB_MAPPING);
  const allowedLib = PREFIX_LIB_MAPPING[prefix];
  return prefixes
    .filter((p) => p !== prefix)
    .map((p) => ({
      group: [PREFIX_LIB_MAPPING[p], `${PREFIX_LIB_MAPPING[p]}/*`],
      message: `${prefix}.repo.ts can only import from ${allowedLib}. Use the correct repository file for this lib.`,
    }));
}

// ---------------------------------------------------------------------------
// 5. Lib-boundary patterns
// ---------------------------------------------------------------------------

const LIB_BOUNDARY_PATTERNS = [
  {
    group: ["@/lib/*", "@/lib/**"],
    message:
      "@/lib/* can only be imported from repositories (lib-boundary violation)",
  },
];

// ---------------------------------------------------------------------------
// Config builder
// ---------------------------------------------------------------------------

/**
 * Build a single ESLint config with merged no-restricted-imports patterns.
 *
 * @param {string} name
 * @param {string[]} files
 * @param  {...object[]} patternArrays
 * @returns {import("eslint").Linter.Config | null}
 */
function makeConfig(name, files, ...patternArrays) {
  const patterns = patternArrays.flat();
  if (patterns.length === 0) return null;
  return {
    name: `imports/${name}`,
    files,
    rules: {
      "no-restricted-imports": ["error", { patterns }],
    },
  };
}

// ---------------------------------------------------------------------------
// Generate all configs
// ---------------------------------------------------------------------------

/**
 * Generate consolidated import restriction configs.
 *
 * Ordering matters: general configs come first and are overridden by
 * specific configs (ESLint flat config "last wins" for the same rule).
 *
 * @returns {import("eslint").Linter.Config[]}
 */
function generateImportConfigs() {
  const configs = [];

  // Catch-all: lib-boundary for all src files (overridden by specific configs below)
  // lib internal cross-references are allowed
  configs.push({
    name: "imports/lib-boundary",
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/**", "src/proxy.ts", "src/app/sitemap.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: LIB_BOUNDARY_PATTERNS }],
    },
  });

  // Repositories (general): layer + cross-feature (repos CAN import @/lib)
  configs.push(
    makeConfig(
      "repositories",
      ["**/repositories/*.ts"],
      LAYER_PATTERNS.repositories,
      CROSS_FEATURE_PATTERNS.repositories,
    ),
  );

  // Repositories (per-prefix): layer + cross-feature + prefix-lib
  for (const prefix of Object.keys(PREFIX_LIB_MAPPING)) {
    const patterns = prefixLibPatterns(prefix);
    if (patterns.length === 0) continue;
    configs.push(
      makeConfig(
        `repositories/${prefix}`,
        [`**/repositories/${prefix}.repo.ts`],
        LAYER_PATTERNS.repositories,
        CROSS_FEATURE_PATTERNS.repositories,
        patterns,
      ),
    );
  }

  // Domain: layer + cross-feature + lib-boundary
  configs.push(
    makeConfig(
      "domain",
      ["**/domain/*.ts"],
      LAYER_PATTERNS.domain,
      CROSS_FEATURE_PATTERNS.domain,
      LIB_BOUNDARY_PATTERNS,
    ),
  );

  // Actions (general): layer + cross-feature + lib-boundary
  configs.push(
    makeConfig(
      "actions",
      ["**/actions/*.ts"],
      LAYER_PATTERNS.actions,
      CROSS_FEATURE_PATTERNS.actions,
      LIB_BOUNDARY_PATTERNS,
    ),
  );

  // Actions (per-prefix): layer + cross-feature + cardinality + lib-boundary
  for (const prefix of ["server", "client", "admin"]) {
    configs.push(
      makeConfig(
        `actions/${prefix}`,
        [`**/actions/${prefix}.action.ts`],
        LAYER_PATTERNS.actions,
        CROSS_FEATURE_PATTERNS.actions,
        CARDINALITY_PATTERNS[prefix],
        LIB_BOUNDARY_PATTERNS,
      ),
    );
  }

  return configs.filter(Boolean);
}

/**
 * Consolidated import restriction configurations.
 * @type {import("eslint").Linter.Config[]}
 */
export const importsConfigs = generateImportConfigs();
