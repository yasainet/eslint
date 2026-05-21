import { flatEntryPointRule } from "./flat-entry-point.mjs";

export const denoLocalPlugin = {
  rules: {
    "flat-entry-point": flatEntryPointRule,
  },
};
