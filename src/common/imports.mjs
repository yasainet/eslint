import { PREFIX_LIB_MAPPING } from "./constants.mjs";

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

const LIB_BOUNDARY_PATTERNS = [
  {
    group: ["@/lib/*", "@/lib/**"],
    message:
      "@/lib/* can only be imported from repositories (lib-boundary violation)",
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

/** @description Next.js-only: restrict @/lib imports to repositories */
export const libBoundaryConfigs = [
  {
    name: "imports/lib-boundary",
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/lib/**",
      "src/proxy.ts",
      "src/app/sitemap.ts",
      "src/features/**/repositories/**",
    ],
    rules: {
      "no-restricted-imports": ["error", { patterns: LIB_BOUNDARY_PATTERNS }],
    },
  },
];

/** @description Scope import restriction rules to the given feature root */
export function createImportsConfigs(featureRoot) {
  const configs = [];

  configs.push(
    makeConfig(
      "repositories",
      [`${featureRoot}/**/repositories/*.ts`],
      LAYER_PATTERNS.repositories,
      LATERAL_PATTERNS.repositories,
    ),
  );

  for (const prefix of Object.keys(PREFIX_LIB_MAPPING)) {
    const patterns = prefixLibPatterns(prefix);
    if (patterns.length === 0) continue;
    configs.push(
      makeConfig(
        `repositories/${prefix}`,
        [`${featureRoot}/**/repositories/${prefix}.repo.ts`],
        LAYER_PATTERNS.repositories,
        LATERAL_PATTERNS.repositories,
        patterns,
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
    ),
  );

  for (const prefix of ["server", "client", "admin"]) {
    configs.push(
      makeConfig(
        `actions/${prefix}`,
        [`${featureRoot}/**/actions/${prefix}.action.ts`],
        LAYER_PATTERNS.actions,
        LATERAL_PATTERNS.actions,
        CARDINALITY_PATTERNS[prefix],
        LIB_BOUNDARY_PATTERNS,
      ),
    );
  }

  return configs.filter(Boolean);
}
