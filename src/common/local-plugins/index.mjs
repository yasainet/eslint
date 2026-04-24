import { actionHandleServiceRule } from "./action-handle-service.mjs";
import { featureNameRule } from "./feature-name.mjs";
import { importPathStyleRule } from "./import-path-style.mjs";
import { namespaceImportNameRule } from "./namespace-import-name.mjs";
import { noAnyReturnRule } from "./no-any-return.mjs";
import { schemaNamingRule } from "./schema-naming.mjs";

/** Single plugin object to avoid ESLint "Cannot redefine plugin" errors. */
export const localPlugin = {
  rules: {
    "action-handle-service": actionHandleServiceRule,
    "feature-name": featureNameRule,
    "import-path-style": importPathStyleRule,
    "namespace-import-name": namespaceImportNameRule,
    "no-any-return": noAnyReturnRule,
    "schema-naming": schemaNamingRule,
  },
};
