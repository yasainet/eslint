import directives from "./directives.mjs";
import errors from "./errors.mjs";
import imports from "./imports.mjs";
import naming from "./naming.mjs";

export default [...naming, ...imports, ...directives, ...errors];
