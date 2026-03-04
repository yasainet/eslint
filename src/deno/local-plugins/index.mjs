import { flatEntryPointRule } from "./flat-entry-point.mjs";

/** Deno-specific local plugin (independent from common localPlugin). */
export const denoLocalPlugin = {
  rules: {
    "flat-entry-point": flatEntryPointRule,
  },
};
