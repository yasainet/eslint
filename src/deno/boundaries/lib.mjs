const FUNCTIONS_ROOT = "supabase/functions";
const FEATURE_ROOT = "supabase/functions/_features";

export const denoLibBoundaryConfigs = [
  {
    name: "deno/lib-boundary",
    files: [`${FUNCTIONS_ROOT}/**/*.ts`],
    ignores: [
      `${FUNCTIONS_ROOT}/_lib/**`,
      `${FEATURE_ROOT}/**/queries/**`,
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
                "_lib/ can only be imported from queries (lib-boundary violation)",
            },
          ],
        },
      ],
    },
  },
];
