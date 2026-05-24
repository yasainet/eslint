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
                "_lib/ は queries からのみ import 可。他層は queries 経由で使う。",
            },
          ],
        },
      ],
    },
  },
];
