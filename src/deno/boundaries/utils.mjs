const FUNCTIONS_ROOT = "supabase/functions";

export const denoUtilsBoundaryConfigs = [
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
