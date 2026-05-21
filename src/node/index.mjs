import { createEntryPointConfigs } from "../common/entry-points.mjs";
import { createCommonConfigs } from "../common/index.mjs";

const nodeEntryPointConfigs = createEntryPointConfigs(
  ["scripts/commands/*.ts"],
);

export const eslintConfig = [
  ...createCommonConfigs("scripts/features", { banAliasImports: true }),
  ...nodeEntryPointConfigs,
];
