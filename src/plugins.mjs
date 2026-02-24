/**
 * @fileoverview ESLint plugin imports and exports.
 */

import stylistic from "@stylistic/eslint-plugin";
import checkFile from "eslint-plugin-check-file";
import jsdocPlugin from "eslint-plugin-jsdoc";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";

/**
 * Plugin namespace mapping for ESLint configuration.
 * @type {Record<string, import("eslint").ESLint.Plugin>}
 */
export const plugins = {
  "@stylistic": stylistic,
  "check-file": checkFile,
  jsdoc: jsdocPlugin,
  "react-you-might-not-need-an-effect": reactYouMightNotNeedAnEffect,
  "simple-import-sort": simpleImportSortPlugin,
};

export {
  checkFile,
  jsdocPlugin,
  reactYouMightNotNeedAnEffect,
  simpleImportSortPlugin,
  stylistic,
};
