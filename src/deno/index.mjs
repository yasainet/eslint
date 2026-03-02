import { createCommonConfigs } from "../common/index.mjs";

/** @description Deno ESLint flat config entry point */
export const eslintConfig = [
  ...createCommonConfigs("supabase/functions/features", {
    banAliasImports: true,
  }),
];
