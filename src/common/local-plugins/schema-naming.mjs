/**
 * Enforce that exported variables in schema files use camelCase with a "Schema" suffix.
 * e.g., `export const userSchema = z.object(...)` is valid.
 *       `export const UserSchema = ...` or `export const user = ...` are invalid.
 * `export type` declarations are ignored (used for `z.infer` types).
 */
export const schemaNamingRule = {
  meta: {
    type: "problem",
    messages: {
      missingSuffix:
        "Exported variable '{{ name }}' in a schema file must end with 'Schema'.",
      invalidCasing:
        "Exported variable '{{ name }}' must be camelCase (start with a lowercase letter).",
    },
    schema: [],
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration || node.declaration.type !== "VariableDeclaration") {
          return;
        }

        for (const declarator of node.declaration.declarations) {
          const name = declarator.id.name;

          if (!name.endsWith("Schema")) {
            context.report({
              node: declarator.id,
              messageId: "missingSuffix",
              data: { name },
            });
          } else if (name[0] !== name[0].toLowerCase()) {
            context.report({
              node: declarator.id,
              messageId: "invalidCasing",
              data: { name },
            });
          }
        }
      },
    };
  },
};
