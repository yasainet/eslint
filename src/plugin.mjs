import directive from "./rules/directive.mjs";
import featureFileName from "./rules/feature-file-name.mjs";
import featureName from "./rules/feature-name.mjs";
import namespaceImportName from "./rules/namespace-import-name.mjs";
import noParentImport from "./rules/no-parent-import.mjs";
import noTryCatch from "./rules/no-try-catch.mjs";
import queriesLib from "./rules/queries-lib.mjs";
import scope from "./rules/scope.mjs";

export default {
  rules: {
    directive,
    "feature-file-name": featureFileName,
    "feature-name": featureName,
    "namespace-import-name": namespaceImportName,
    "no-parent-import": noParentImport,
    "no-try-catch": noTryCatch,
    "queries-lib": queriesLib,
    scope,
  },
};
