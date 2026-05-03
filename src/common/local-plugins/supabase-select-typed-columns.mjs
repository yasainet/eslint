/**
 * Enforce typed column constants for Supabase `.select()` calls.
 *
 * Apply to `**\/queries/*.query.ts`. Forces `.select()` to take the form
 * `joinColumns(<X_COLUMNS>)` where `X_COLUMNS` is an UPPER_SNAKE identifier
 * ending with `_COLUMNS`. The identifier is expected to be declared with
 * `as const satisfies readonly (keyof Tables<"table">)[]` so the column
 * names are validated against the schema at compile time. The `satisfies`
 * shape itself is enforced by the companion `supabase-columns-satisfies`
 * rule.
 *
 * `joinColumns()` is a project-supplied helper that comma-joins a const
 * string tuple while preserving the literal string type so Supabase's
 * `.select()` type parser can infer the row shape (a plain `.join(",")`
 * widens to `string` and breaks inference).
 *
 * Banned:
 *   .select()                                implicit "all columns"
 *   .select("*")                             silent exposure of new schema columns
 *   .select("id, name")                      inline literal, invisible to grep
 *   .select(`${x}, y`)                       dynamic concatenation
 *   .select(POST_LIST_COLUMNS.join(","))     plain .join widens to `string`, breaks inference
 *   .select(someVar)                         non-conforming variable
 *
 * Allowed:
 *   .select(joinColumns(POST_LIST_COLUMNS))  typed constant via project helper
 *
 * Why: column lists must be (1) named for grep / review, (2) checked
 * against the schema, (3) never silently grow on schema additions.
 * For column-level access control, use Postgres views (`from("posts_public")`).
 */

const COLUMNS_NAME = /^[A-Z][A-Z0-9_]*_COLUMNS$/;

function asJoinColumnsCall(arg) {
  if (!arg) return null;
  if (arg.type !== "CallExpression") return null;
  if (arg.callee.type !== "Identifier") return null;
  if (arg.callee.name !== "joinColumns") return null;
  if (arg.arguments.length !== 1) return null;
  if (arg.arguments[0].type !== "Identifier") return null;
  return arg.arguments[0];
}

export const supabaseSelectTypedColumnsRule = {
  meta: {
    type: "problem",
    messages: {
      noArgs:
        "Empty `.select()` returns all columns implicitly. Pass `joinColumns(<X_COLUMNS>)` where X_COLUMNS is a typed constant.",
      literalArg:
        'Inline `.select()` argument is forbidden. Define `const X_COLUMNS = [...] as const satisfies readonly (keyof Tables<"table">)[];` and call `.select(joinColumns(X_COLUMNS))`. Use Postgres views for column-level access control.',
      shapeArg:
        '`.select()` argument must be `joinColumns(<X_COLUMNS>)`. Other expressions defeat type inference and column-level review.',
      naming:
        "Column constant `{{ name }}` must be UPPER_SNAKE_CASE ending with `_COLUMNS` (e.g. POST_LIST_COLUMNS, POST_DETAIL_COLUMNS).",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== "MemberExpression") return;
        if (node.callee.property.type !== "Identifier") return;
        if (node.callee.property.name !== "select") return;

        if (node.arguments.length === 0) {
          context.report({ node, messageId: "noArgs" });
          return;
        }

        const arg = node.arguments[0];

        if (arg.type === "Literal" || arg.type === "TemplateLiteral") {
          context.report({ node: arg, messageId: "literalArg" });
          return;
        }

        const id = asJoinColumnsCall(arg);
        if (!id) {
          context.report({ node: arg, messageId: "shapeArg" });
          return;
        }

        if (!COLUMNS_NAME.test(id.name)) {
          context.report({
            node: id,
            messageId: "naming",
            data: { name: id.name },
          });
        }
      },
    };
  },
};
