import stylistic from "@stylistic/eslint-plugin";
import checkFile from "eslint-plugin-check-file";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";

export const plugins = {
  "@stylistic": stylistic,
  "check-file": checkFile,
  "simple-import-sort": simpleImportSortPlugin,
};

export { checkFile, simpleImportSortPlugin, stylistic };
