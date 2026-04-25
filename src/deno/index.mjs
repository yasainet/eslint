import { createEntryPointConfigs } from "../common/entry-points.mjs";
import { createCommonConfigs } from "../common/index.mjs";
import { denoImportsConfigs } from "./imports.mjs";

const FEATURE_ROOT = "supabase/functions/_features";

const denoEntryPointConfigs = createEntryPointConfigs(
  ["supabase/functions/**/*.ts"],
  ["supabase/functions/_*/**"],
);

// Deno files are not covered by the consumer's project tsconfig
// (Supabase functions live outside Next.js's tsconfig), so type-aware
// rules cannot consult the type checker. Disable them here and rely on
// `deno check` / `deno lint` for type-level guarantees.
//
// `rulesFiles` is narrowed so the override only affects Deno files. When this
// entry is combined with `next`/`node`, those entries keep their type-aware
// settings on their own files.
/** Deno ESLint flat config entry point. */
export const eslintConfig = [
  ...createCommonConfigs(FEATURE_ROOT, {
    banAliasImports: true,
    typeAware: false,
    rulesFiles: ["supabase/functions/**/*.ts"],
  }),
  ...denoImportsConfigs,
  ...denoEntryPointConfigs,
];
