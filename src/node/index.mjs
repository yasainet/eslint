import { createEntryPointConfigs } from "../common/entry-points.mjs";
import { createCommonConfigs } from "../common/index.mjs";

const nodeEntryPointConfigs = createEntryPointConfigs(
  ["scripts/commands/*.ts"],
);

/** Node.js ESLint flat config entry point. */
export const eslintConfig = [
  ...createCommonConfigs("scripts/features", { banAliasImports: true }),
  ...nodeEntryPointConfigs,
];
