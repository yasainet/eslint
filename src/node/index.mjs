import { createCommonConfigs } from "../common/index.mjs";

/** @description Node.js ESLint flat config entry point */
export const eslintConfig = [
  ...createCommonConfigs("scripts/features", { banAliasImports: true }),
];
