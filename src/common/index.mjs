/**
 * @fileoverview Common ESLint configuration aggregator.
 *
 * Combines environment-agnostic configuration modules:
 * rules → naming → layers → imports → jsdoc
 */

import { importsConfigs } from "./imports.mjs";
import { jsdocConfigs } from "./jsdoc.mjs";
import { layersConfigs } from "./layers.mjs";
import { namingConfigs } from "./naming.mjs";
import { rulesConfigs } from "./rules.mjs";

/**
 * Common ESLint configurations shared across all environments.
 * @type {import("eslint").Linter.Config[]}
 */
export const commonConfigs = [
  ...rulesConfigs,
  ...namingConfigs,
  ...layersConfigs,
  ...importsConfigs,
  ...jsdocConfigs,
];
