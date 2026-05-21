export const loggerSelector = "CallExpression[callee.object.name='logger']";

export const loggerMessage =
  "logger is not allowed outside entries. Logging belongs in entries.";

export const aliasDynamicImportSelector =
  "ImportExpression[source.type='Literal'][source.value=/^@\\//]";

export const aliasDynamicImportMessage =
  "Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.";
