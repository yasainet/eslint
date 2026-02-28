import { createCommonConfigs } from "../common/index.mjs";

export const eslintConfig = [
  ...createCommonConfigs("supabase/functions/features"),
];
