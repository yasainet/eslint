import { createEntryPointConfigs } from "../common/entry-points.mjs";
import { createCommonConfigs } from "../common/index.mjs";
import { denoImportsConfigs } from "./imports.mjs";

const FEATURE_ROOT = "supabase/functions/_features";

const denoEntryPointConfigs = createEntryPointConfigs(
  ["supabase/functions/**/*.ts"],
  ["supabase/functions/_*/**"],
);

export const eslintConfig = [
  ...createCommonConfigs(FEATURE_ROOT, {
    banAliasImports: true,
    typeAware: false,
    rulesFiles: ["supabase/functions/**/*.ts"],
  }),
  ...denoImportsConfigs,
  ...denoEntryPointConfigs,
];
