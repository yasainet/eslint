import { createCommonConfigs } from "../common/index.mjs";
import { denoImportsConfigs } from "./imports.mjs";

const FEATURE_ROOT = "supabase/functions/_features";

/** Deno ESLint flat config entry point. */
export const eslintConfig = [
  ...createCommonConfigs(FEATURE_ROOT, { banAliasImports: true }),
  ...denoImportsConfigs,
];
