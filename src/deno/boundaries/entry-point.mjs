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
                "Top-level files must not import services directly. Import from entries instead.",
            },
            {
              group: ["**/queries/*", "**/queries"],
              message:
                "Top-level files must not import queries directly. Import from entries instead.",
            },
            {
              group: ["*/_lib/*", "*/_lib/**"],
              message:
                "Top-level files must not import _lib/ directly. Import from entries instead.",
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
