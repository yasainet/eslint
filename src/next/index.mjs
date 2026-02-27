/**
 * @fileoverview Next.js ESLint configuration entry point.
 *
 * Combines common configs with Next.js-specific rules:
 * common (rules, naming, layers, imports, jsdoc)
 * + Next.js (hooks/components naming, hooks layers, directives)
 *
 * Does NOT include Next.js presets (core-web-vitals, typescript).
 * Consumer should add those separately via eslint-config-next.
 */

import { commonConfigs } from "../common/index.mjs";

import { directivesConfigs } from "./directives.mjs";
import { layersConfigs } from "./layers.mjs";
import { namingConfigs } from "./naming.mjs";

/**
 * Complete Next.js ESLint configuration array.
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfig = [
  ...commonConfigs,
  ...namingConfigs,
  ...layersConfigs,
  ...directivesConfigs,
];
