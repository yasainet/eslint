import { createEntryPointConfigs } from "../common/boundaries/entry-point.mjs";
import { createCommonConfigs } from "../common/index.mjs";

import { denoEntryPointConfigs } from "./boundaries/entry-point.mjs";
import { denoLibBoundaryConfigs } from "./boundaries/lib.mjs";
import { denoUtilsBoundaryConfigs } from "./boundaries/utils.mjs";

const FEATURE_ROOT = "supabase/functions/_features";

const denoNamespaceImportConfigs = createEntryPointConfigs(
  ["supabase/functions/**/*.ts"],
  ["supabase/functions/_*/**"],
);

export const eslintConfig = [
  ...createCommonConfigs(FEATURE_ROOT, {
    banAliasImports: true,
    typeAware: false,
    rulesFiles: ["supabase/functions/**/*.ts"],
  }),
  ...denoLibBoundaryConfigs,
  ...denoEntryPointConfigs,
  ...denoUtilsBoundaryConfigs,
  ...denoNamespaceImportConfigs,
];
