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
    name: "deno/commands-entry-point",
    files: [`${FUNCTIONS_ROOT}/commands/**/*.ts`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/services/*", "**/services"],
              message:
                "commands/ must not import services directly. Import from actions instead.",
            },
            {
              group: ["**/repositories/*", "**/repositories"],
              message:
                "commands/ must not import repositories directly. Import from actions instead.",
            },
            {
              group: ["*/_lib/*", "*/_lib/**"],
              message:
                "commands/ must not import _lib/ directly. Import from actions instead.",
            },
          ],
        },
      ],
    },
  },
];
