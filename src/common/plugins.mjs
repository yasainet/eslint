import stylistic from "@stylistic/eslint-plugin";
import checkFile from "eslint-plugin-check-file";
import jsdocPlugin from "eslint-plugin-jsdoc";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";

export const plugins = {
  "@stylistic": stylistic,
  "check-file": checkFile,
  jsdoc: jsdocPlugin,
  "simple-import-sort": simpleImportSortPlugin,
};

export { checkFile, jsdocPlugin, simpleImportSortPlugin, stylistic };
