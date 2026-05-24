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
              message: "_utils/ は _features/ を import 不可。依存方向を守る。",
            },
            {
              group: ["*/_lib/*", "*/_lib/**"],
              message: "_utils/ は _lib/ を import 不可。依存方向を守る。",
            },
          ],
        },
      ],
    },
  },
];
