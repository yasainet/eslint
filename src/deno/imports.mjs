const FUNCTIONS_ROOT = "supabase/functions";
const FEATURE_ROOT = "supabase/functions/_features";

/** Deno-specific import restriction rules. */
export const denoImportsConfigs = [
  {
    name: "deno/lib-boundary",
    files: [`${FUNCTIONS_ROOT}/**/*.ts`],
    ignores: [
      `${FUNCTIONS_ROOT}/_lib/**`,
      `${FEATURE_ROOT}/**/repositories/**`,
      `${FEATURE_ROOT}/**/types/**`,
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*/_lib/*", "*/_lib/**"],
              message:
                "_lib/ can only be imported from repositories (lib-boundary violation)",
            },
          ],
        },
      ],
    },
  },
  {
    name: "deno/entry-point",
    files: [`${FUNCTIONS_ROOT}/**/*.ts`],
    ignores: [`${FUNCTIONS_ROOT}/_*/**`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/services/*", "**/services"],
              message:
                "Entry points must not import services directly. Import from actions instead.",
            },
            {
              group: ["**/repositories/*", "**/repositories"],
              message:
                "Entry points must not import repositories directly. Import from actions instead.",
            },
            {
              group: ["*/_lib/*", "*/_lib/**"],
              message:
                "Entry points must not import _lib/ directly. Import from actions instead.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "deno/utils-boundary",
    files: [`${FUNCTIONS_ROOT}/_utils/**/*.ts`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*/_features/*", "*/_features/**"],
              message: "_utils/ cannot import _features/",
            },
            {
              group: ["*/_lib/*", "*/_lib/**"],
              message: "_utils/ cannot import _lib/",
            },
          ],
        },
      ],
    },
  },
];
