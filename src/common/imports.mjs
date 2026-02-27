import { PREFIX_LIB_MAPPING } from "./constants.mjs";

// ---------------------------------------------------------------------------
// 1. Layer patterns
// ---------------------------------------------------------------------------

const LAYER_PATTERNS = {
  repositories: [
    {
      group: ["*/services/*", "*/services"],
      message: "repositories cannot import services (layer violation)",
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
  services: [
    {
      group: ["*/actions/*", "*/actions"],
      message: "services cannot import actions (layer violation)",
    },
    {
      group: ["*/hooks/*", "*/hooks"],
      message: "services cannot import hooks (layer violation)",
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
  services: [
    {
      group: ["@/features/*/services/*", "@/features/*/services"],
      message:
        "services cannot import other feature's services (cross-feature violation)",
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
      group: ["**/services/client.service*", "**/services/admin.service*"],
      message:
        "server.action can only import server.service (cardinality violation)",
    },
  ],
  client: [
    {
      group: ["**/services/server.service*", "**/services/admin.service*"],
      message:
        "client.action can only import client.service (cardinality violation)",
    },
  ],
  admin: [
    {
      group: ["**/services/server.service*", "**/services/client.service*"],
      message:
        "admin.action can only import admin.service (cardinality violation)",
    },
  ],
};

// ---------------------------------------------------------------------------
// 4. Prefix-lib pattern generator
// ---------------------------------------------------------------------------

/** @description Generate forbidden lib patterns for a given prefix. */
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

/** @description Build a single ESLint config with merged no-restricted-imports patterns. */
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
 * @description Generate consolidated import restriction configs.
 * Ordering matters: general configs first, overridden by specific configs (flat config "last wins").
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

  // Services: layer + cross-feature + lib-boundary
  configs.push(
    makeConfig(
      "services",
      ["**/services/*.ts"],
      LAYER_PATTERNS.services,
      CROSS_FEATURE_PATTERNS.services,
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

export const importsConfigs = generateImportConfigs();
