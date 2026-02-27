/**
 * @fileoverview Node.js ESLint configuration entry point.
 *
 * Exports common configs only (rules, naming, layers, imports, jsdoc).
 * No framework-specific rules are included.
 */

import { commonConfigs } from "../common/index.mjs";

/**
 * Node.js ESLint configuration array.
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfig = [...commonConfigs];
