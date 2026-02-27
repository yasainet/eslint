/**
 * @fileoverview Common ESLint plugin imports and exports.
 */

import stylistic from "@stylistic/eslint-plugin";
import checkFile from "eslint-plugin-check-file";
import jsdocPlugin from "eslint-plugin-jsdoc";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";

/**
 * Common plugin namespace mapping for ESLint configuration.
 * @type {Record<string, import("eslint").ESLint.Plugin>}
 */
export const plugins = {
  "@stylistic": stylistic,
  "check-file": checkFile,
  jsdoc: jsdocPlugin,
  "simple-import-sort": simpleImportSortPlugin,
};

export { checkFile, jsdocPlugin, simpleImportSortPlugin, stylistic };
