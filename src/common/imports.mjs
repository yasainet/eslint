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
      group: ["*/repositories/*", "*/repositories"],
      message: "actions cannot import repositories (layer violation)",
    },
    {
      group: ["*/hooks/*", "*/hooks"],
      message: "actions cannot import hooks (layer violation)",
    },
  ],
};

const LATERAL_PATTERNS = {
  repositories: [
    {
      group: ["@/features/*/repositories/*", "@/features/*/repositories"],
      message:
        "repositories cannot import other feature's repositories (lateral violation)",
    },
  ],
  services: [
    {
      group: ["@/features/*/services/*", "@/features/*/services"],
      message:
        "services cannot import other feature's services (lateral violation)",
    },
  ],
  actions: [
    {
      group: ["@/features/*/actions/*", "@/features/*/actions"],
      message:
        "actions cannot import other feature's actions (lateral violation)",
    },
  ],
};

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

function prefixLibPatterns(prefix, mapping) {
  const prefixes = Object.keys(mapping);
  const allowedLib = mapping[prefix];
  return prefixes
    .filter((p) => p !== prefix)
    .map((p) => ({
      group: [`**/lib/${mapping[p]}`, `**/lib/${mapping[p]}/*`],
      message: `${prefix}.repo.ts can only import from lib/${allowedLib}. Use the correct repository file for this lib.`,
    }));
}

const LIB_BOUNDARY_PATTERNS = [
  {
    group: ["@/lib/*", "@/lib/**"],
    message:
      "lib/* can only be imported from repositories (lib-boundary violation)",
  },
];

const MAPPING_PATTERNS = [
  {
    group: ["@/utils/mapping.util"],
    importNames: ["mapSnakeToCamel", "mapCamelToSnake"],
    message:
      "Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.",
  },
];

const PAGE_BOUNDARY_PATTERNS = [
  {
    group: ["*/repositories/*", "*/repositories"],
    message:
      "page.tsx can only import actions, not repositories (page-boundary violation)",
  },
  {
    group: ["*/services/*", "*/services"],
    message:
      "page.tsx can only import actions, not services (page-boundary violation)",
  },
];

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

/** Next.js-only: restrict page.tsx to only import actions. */
export const pageBoundaryConfigs = [
  {
    name: "imports/page-boundary",
    files: ["src/app/**/page.tsx"],
    rules: {
      "no-restricted-imports": ["error", { patterns: PAGE_BOUNDARY_PATTERNS }],
    },
  },
];

/**
 * Next.js-only: restrict @/lib imports and mapping imports outside features.
 * Per-feature subdir rules live in createImportsConfigs to avoid clobbering each other.
 */
export const libBoundaryConfigs = [
  {
    name: "imports/lib-boundary",
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/lib/**",
      "src/proxy.ts",
      "src/app/sitemap.ts",
      "src/app/**/route.ts",
      "src/features/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [...LIB_BOUNDARY_PATTERNS, ...MAPPING_PATTERNS] },
      ],
    },
  },
];

/** Scope import restriction rules to the given feature root. */
export function createImportsConfigs(
  featureRoot,
  prefixLibMapping,
  { banAliasImports = false } = {},
) {
  const configs = [];

  if (banAliasImports) {
    configs.push({
      name: "imports/ban-alias",
      files: [`${featureRoot}/**/*.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/*", "@/**"],
                message:
                  "Alias imports (@/) are not available in this environment. Use relative paths.",
              },
            ],
          },
        ],
      },
    });
  }

  configs.push(
    makeConfig(
      "repositories",
      [`${featureRoot}/**/repositories/*.ts`],
      LAYER_PATTERNS.repositories,
      LATERAL_PATTERNS.repositories,
      MAPPING_PATTERNS,
    ),
  );

  for (const prefix of Object.keys(prefixLibMapping)) {
    const patterns = prefixLibPatterns(prefix, prefixLibMapping);
    if (patterns.length === 0) continue;
    configs.push(
      makeConfig(
        `repositories/${prefix}`,
        [`${featureRoot}/**/repositories/${prefix}.repo.ts`],
        LAYER_PATTERNS.repositories,
        LATERAL_PATTERNS.repositories,
        patterns,
        MAPPING_PATTERNS,
      ),
    );
  }

  configs.push(
    makeConfig(
      "services",
      [`${featureRoot}/**/services/*.ts`],
      LAYER_PATTERNS.services,
      LATERAL_PATTERNS.services,
      LIB_BOUNDARY_PATTERNS,
    ),
  );

  configs.push(
    makeConfig(
      "actions",
      [`${featureRoot}/**/actions/*.ts`],
      LAYER_PATTERNS.actions,
      LATERAL_PATTERNS.actions,
      LIB_BOUNDARY_PATTERNS,
      MAPPING_PATTERNS,
    ),
  );

  configs.push(
    makeConfig(
      "utils",
      [`${featureRoot}/**/utils/*.ts`],
      LIB_BOUNDARY_PATTERNS,
      MAPPING_PATTERNS,
    ),
  );

  // Catch-all for feature subdirs without a per-layer config
  // (constants, hooks, schemas). lib-boundary + mapping ban.
  configs.push({
    name: "imports/feature-other",
    files: [`${featureRoot}/**/*.ts`],
    ignores: [
      `${featureRoot}/**/services/*.ts`,
      `${featureRoot}/**/repositories/*.ts`,
      `${featureRoot}/**/actions/*.ts`,
      `${featureRoot}/**/utils/*.ts`,
      `${featureRoot}/**/types/*.ts`,
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [...LIB_BOUNDARY_PATTERNS, ...MAPPING_PATTERNS] },
      ],
    },
  });

  // Types: mapping ban only. lib is allowed (Database/Tables type imports).
  configs.push({
    name: "imports/feature-types",
    files: [`${featureRoot}/**/types/*.ts`],
    rules: {
      "no-restricted-imports": ["error", { patterns: MAPPING_PATTERNS }],
    },
  });

  for (const prefix of ["server", "client", "admin"]) {
    configs.push(
      makeConfig(
        `actions/${prefix}`,
        [`${featureRoot}/**/actions/${prefix}.action.ts`],
        LAYER_PATTERNS.actions,
        LATERAL_PATTERNS.actions,
        CARDINALITY_PATTERNS[prefix],
        LIB_BOUNDARY_PATTERNS,
        MAPPING_PATTERNS,
      ),
    );
  }

  return configs.filter(Boolean);
}
