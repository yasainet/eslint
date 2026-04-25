import { featureNameRule } from "./feature-name.mjs";
import { importPathStyleRule } from "./import-path-style.mjs";
import { namespaceImportNameRule } from "./namespace-import-name.mjs";
import { noAnyReturnRule } from "./no-any-return.mjs";
import { queriesExportRule } from "./queries-export.mjs";
import { schemaNamingRule } from "./schema-naming.mjs";

/** Single plugin object to avoid ESLint "Cannot redefine plugin" errors. */
export const localPlugin = {
  rules: {
    "feature-name": featureNameRule,
    "import-path-style": importPathStyleRule,
    "namespace-import-name": namespaceImportNameRule,
    "no-any-return": noAnyReturnRule,
    "queries-export": queriesExportRule,
    "schema-naming": schemaNamingRule,
  },
};
