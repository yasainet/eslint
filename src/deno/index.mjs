import { createCommonConfigs } from "../common/index.mjs";

/** Deno ESLint flat config entry point. */
export const eslintConfig = [
  ...createCommonConfigs("supabase/functions/features", {
    banAliasImports: true,
  }),
];
