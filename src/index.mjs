import base from "./base.mjs";
import directives from "./directives.mjs";
import errors from "./errors.mjs";
import imports from "./imports.mjs";
import naming from "./naming.mjs";
import scopes from "./scopes.mjs";

export default [
  ...base,
  ...naming,
  ...imports,
  ...directives,
  ...errors,
  ...scopes,
];
