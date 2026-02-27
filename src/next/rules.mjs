/**
 * @fileoverview Next.js-specific rules (React hooks effect linting).
 */

import { reactYouMightNotNeedAnEffect } from "./plugins.mjs";

/**
 * Next.js-specific rule configurations.
 * @type {import("eslint").Linter.Config[]}
 */
export const rulesConfigs = [
  {
    name: "next/rules",
    plugins: {
      "react-you-might-not-need-an-effect": reactYouMightNotNeedAnEffect,
    },
    rules: {
      ...reactYouMightNotNeedAnEffect.configs.recommended.rules,
    },
  },
];
