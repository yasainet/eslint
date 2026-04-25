import { featureNameRule } from "./feature-name.mjs";
import { formStateNamingRule } from "./form-state-naming.mjs";
import { importPathStyleRule } from "./import-path-style.mjs";
import { namespaceImportNameRule } from "./namespace-import-name.mjs";
import { noAnyReturnRule } from "./no-any-return.mjs";
import { queriesExportRule } from "./queries-export.mjs";
import { queriesNamespaceImportRule } from "./queries-namespace-import.mjs";
import { schemaNamingRule } from "./schema-naming.mjs";

/** Single plugin object to avoid ESLint "Cannot redefine plugin" errors. */
export const localPlugin = {
  rules: {
    "feature-name": featureNameRule,
    "form-state-naming": formStateNamingRule,
    "import-path-style": importPathStyleRule,
    "namespace-import-name": namespaceImportNameRule,
    "no-any-return": noAnyReturnRule,
    "queries-export": queriesExportRule,
    "queries-namespace-import": queriesNamespaceImportRule,
    "schema-naming": schemaNamingRule,
  },
};
