import { createCommonConfigs } from "../common/index.mjs";

/** Hono ESLint flat config entry point. */
export const eslintConfig = [
  ...createCommonConfigs("src/features", { banAliasImports: true }),
];
