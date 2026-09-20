import directive from "./rules/directive.mjs";
import namespaceImportName from "./rules/namespace-import-name.mjs";
import noParentImport from "./rules/no-parent-import.mjs";
import noTryCatch from "./rules/no-try-catch.mjs";

export default {
  rules: {
    directive,
    "namespace-import-name": namespaceImportName,
    "no-parent-import": noParentImport,
    "no-try-catch": noTryCatch,
  },
};
