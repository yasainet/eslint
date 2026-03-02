import { actionHandleServiceRule } from "./action-handle-service.mjs";
import { importPathStyleRule } from "./import-path-style.mjs";

/** Single plugin object to avoid ESLint "Cannot redefine plugin" errors. */
export const localPlugin = {
  rules: {
    "action-handle-service": actionHandleServiceRule,
    "import-path-style": importPathStyleRule,
  },
};
