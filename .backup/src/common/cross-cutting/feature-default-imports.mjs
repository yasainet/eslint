import {
  LIB_BOUNDARY_PATTERNS,
  MAPPING_PATTERNS,
} from "../_internal/import-patterns.mjs";

export function createFeatureDefaultImportsConfigs({ featureRoot }) {
  return [
    {
      name: "imports/feature-other",
      files: [`${featureRoot}/**/*.ts`],
      ignores: [
        `${featureRoot}/**/services/*.ts`,
        `${featureRoot}/**/queries/*.ts`,
        `${featureRoot}/**/entries/*.ts`,
        `${featureRoot}/**/utils/*.ts`,
        `${featureRoot}/**/types/*.ts`,
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: [...LIB_BOUNDARY_PATTERNS, ...MAPPING_PATTERNS] },
        ],
      },
    },
  ];
}
