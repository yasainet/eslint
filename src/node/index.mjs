import { createEntryPointConfigs } from "../common/boundaries/entry-point.mjs";
import { createCommonConfigs } from "../common/index.mjs";

const nodeEntryPointConfigs = createEntryPointConfigs(
  ["scripts/commands/*.ts"],
);

const yasainetConfig = [
  ...createCommonConfigs("scripts/features", { banAliasImports: true }),
  ...nodeEntryPointConfigs,
];

export default yasainetConfig;
