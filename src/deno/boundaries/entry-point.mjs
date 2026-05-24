import { denoLocalPlugin } from "../local-plugins/index.mjs";

const FUNCTIONS_ROOT = "supabase/functions";

export const denoEntryPointConfigs = [
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
                "top-level file は services を直接 import 不可。entries 経由で使う。",
            },
            {
              group: ["**/queries/*", "**/queries"],
              message:
                "top-level file は queries を直接 import 不可。entries 経由で使う。",
            },
            {
              group: ["*/_lib/*", "*/_lib/**"],
              message:
                "top-level file は _lib/ を直接 import 不可。entries 経由で使う。",
            },
          ],
        },
      ],
    },
  },
  {
    name: "deno/flat-entry-point",
    files: [`${FUNCTIONS_ROOT}/**/*.ts`],
    ignores: [`${FUNCTIONS_ROOT}/_*/**`],
    plugins: { "deno-local": denoLocalPlugin },
    rules: {
      "deno-local/flat-entry-point": "error",
    },
  },
];
