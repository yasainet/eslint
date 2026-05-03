const LAYER_PATTERNS = {
  queries: [
    {
      group: ["**/services/*", "**/services"],
      message: "queries cannot import services (layer violation)",
    },
    {
      group: ["**/interactors/*", "**/interactors"],
      message: "queries cannot import interactors (layer violation)",
    },
    {
      group: ["**/hooks/*", "**/hooks"],
      message: "queries cannot import hooks (layer violation)",
    },
  ],
  services: [
    {
      group: ["**/interactors/*", "**/interactors"],
      message: "services cannot import interactors (layer violation)",
    },
    {
      group: ["**/hooks/*", "**/hooks"],
      message: "services cannot import hooks (layer violation)",
    },
  ],
  interactors: [
    {
      group: ["**/queries/*", "**/queries"],
      message: "interactors cannot import queries (layer violation)",
    },
    {
      group: ["**/hooks/*", "**/hooks"],
      message: "interactors cannot import hooks (layer violation)",
    },
  ],
};

const LATERAL_PATTERNS = {
  queries: [
    {
      group: ["@/features/*/queries/*", "@/features/*/queries"],
      message:
        "queries cannot import other feature's queries (lateral violation)",
    },
  ],
  services: [
    {
      group: ["@/features/*/services/*", "@/features/*/services"],
      message:
        "services cannot import other feature's services (lateral violation)",
    },
  ],
  interactors: [
    {
      group: ["@/features/*/interactors/*", "@/features/*/interactors"],
      message:
        "interactors cannot import other feature's interactors (lateral violation)",
    },
  ],
};

const CARDINALITY_PATTERNS = {
  server: [
    {
      group: ["**/services/client.service*", "**/services/admin.service*"],
      message:
        "server.interactor can only import server.service (cardinality violation)",
    },
  ],
  client: [
    {
      group: ["**/services/server.service*", "**/services/admin.service*"],
      message:
        "client.interactor can only import client.service (cardinality violation)",
    },
  ],
  admin: [
    {
      group: ["**/services/server.service*", "**/services/client.service*"],
      message:
        "admin.interactor can only import admin.service (cardinality violation)",
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
      message: `${prefix}.query.ts can only import from lib/${allowedLib}. Use the correct query file for this lib.`,
    }));
}

const LIB_BOUNDARY_PATTERNS = [
  {
    group: ["@/lib/*", "@/lib/**"],
    message:
      "lib/* can only be imported from queries (lib-boundary violation)",
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
    group: ["**/queries/*", "**/queries"],
    message:
      "page.tsx can only import interactors, not queries (page-boundary violation)",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "page.tsx can only import interactors, not services (page-boundary violation)",
  },
];

const ROUTE_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "route.ts can only import interactors, not queries (route-boundary violation)",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "route.ts can only import interactors, not services (route-boundary violation)",
  },
];

const HOOKS_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "hooks can only import interactors, not queries (hooks-boundary violation)",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "hooks can only import interactors, not services (hooks-boundary violation)",
  },
];

const COMPONENTS_BOUNDARY_PATTERNS = [
  {
    group: ["**/queries/*", "**/queries"],
    message:
      "components can only import interactors or hooks, not queries (components-boundary violation)",
  },
  {
    group: ["**/services/*", "**/services"],
    message:
      "components can only import interactors or hooks, not services (components-boundary violation)",
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

// In ESLint flat config, when multiple matching configs set the same rule
// (`no-restricted-imports`), the later config's options REPLACE the earlier
// ones — patterns are not merged. Page / hooks / components boundary configs
// run after libBoundaryConfigs and would silently drop lib + mapping bans
// unless we re-include those patterns explicitly.
/** Next.js-only: restrict page.tsx to only import interactors. */
export const pageBoundaryConfigs = [
  {
    name: "imports/page-boundary",
    files: ["src/app/**/page.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...PAGE_BOUNDARY_PATTERNS,
            ...LIB_BOUNDARY_PATTERNS,
            ...MAPPING_PATTERNS,
          ],
        },
      ],
    },
  },
];

/** Next.js-only: restrict route.ts to only import interactors. */
export const routeBoundaryConfigs = [
  {
    name: "imports/route-boundary",
    files: ["src/app/**/route.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...ROUTE_BOUNDARY_PATTERNS,
            ...LIB_BOUNDARY_PATTERNS,
            ...MAPPING_PATTERNS,
          ],
        },
      ],
    },
  },
];

/** Next.js-only: restrict hooks to only import interactors (not queries or services). */
export const hooksBoundaryConfigs = [
  {
    name: "imports/hooks-boundary",
    files: ["src/features/**/hooks/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...HOOKS_BOUNDARY_PATTERNS,
            ...LIB_BOUNDARY_PATTERNS,
            ...MAPPING_PATTERNS,
          ],
        },
      ],
    },
  },
];

/** Next.js-only: restrict components to only import interactors or hooks (not queries or services). */
export const componentsBoundaryConfigs = [
  {
    name: "imports/components-boundary",
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...COMPONENTS_BOUNDARY_PATTERNS,
            ...LIB_BOUNDARY_PATTERNS,
            ...MAPPING_PATTERNS,
          ],
        },
      ],
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
      "queries",
      [`${featureRoot}/**/queries/*.ts`],
      LAYER_PATTERNS.queries,
      LATERAL_PATTERNS.queries,
      MAPPING_PATTERNS,
    ),
  );

  for (const prefix of Object.keys(prefixLibMapping)) {
    const patterns = prefixLibPatterns(prefix, prefixLibMapping);
    if (patterns.length === 0) continue;
    configs.push(
      makeConfig(
        `queries/${prefix}`,
        [`${featureRoot}/**/queries/${prefix}.query.ts`],
        LAYER_PATTERNS.queries,
        LATERAL_PATTERNS.queries,
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
      "interactors",
      [`${featureRoot}/**/interactors/*.ts`],
      LAYER_PATTERNS.interactors,
      LATERAL_PATTERNS.interactors,
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
      `${featureRoot}/**/queries/*.ts`,
      `${featureRoot}/**/interactors/*.ts`,
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
        `interactors/${prefix}`,
        [`${featureRoot}/**/interactors/${prefix}.interactor.ts`],
        LAYER_PATTERNS.interactors,
        LATERAL_PATTERNS.interactors,
        CARDINALITY_PATTERNS[prefix],
        LIB_BOUNDARY_PATTERNS,
        MAPPING_PATTERNS,
      ),
    );
  }

  return configs.filter(Boolean);
}
