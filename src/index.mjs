import base from "./base.mjs";
import directives from "./directives.mjs";
import errors from "./errors.mjs";
import imports from "./imports.mjs";
import naming from "./naming.mjs";
import scopes from "./scopes.mjs";
import tailwindcss from "./tailwindcss.mjs";

export default [
  ...base,
  ...tailwindcss,
  ...naming,
  ...imports,
  ...directives,
  ...errors,
  ...scopes,
];
