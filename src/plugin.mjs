import namespaceImportName from "./rules/namespace-import-name.mjs";
import noParentImport from "./rules/no-parent-import.mjs";

export default {
  rules: {
    "namespace-import-name": namespaceImportName,
    "no-parent-import": noParentImport,
  },
};
