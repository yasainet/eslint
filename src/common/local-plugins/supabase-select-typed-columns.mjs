/**
 * Enforce explicit column lists for Supabase `.select()` calls.
 *
 * Apply to `**\/queries/*.query.ts`. `.select()` の引数は次のいずれかでなければならない:
 *
 * - inline string literal（例: `.select("id,url,platform")`）
 * - `*_COLUMNS` という UPPER_SNAKE 命名の identifier（例: `.select(POST_DETAIL_COLUMNS)`）
 *
 * `*_COLUMNS` 定数は companion rule `supabase-columns-satisfies` で
 * `<string literal> as const` の形が強制される。これにより:
 *
 * - Supabase の `.select()` は literal string を parse して row 型を推論できる
 * - 存在しない column 名は Supabase の型推論が `SelectQueryError` として弾く（compile time）
 * - runtime helper（`joinColumns`）は不要
 *
 * Banned:
 *   .select()                    implicit "all columns"
 *   .select("*")                 silent exposure of new schema columns
 *   .select(`${x},y`)            dynamic concatenation
 *   .select(cols.join(","))      runtime expression
 *   .select(someVar)             non-conforming variable
 *
 * Allowed:
 *   .select("id,url,platform")        inline literal
 *   .select(POST_DETAIL_COLUMNS)      *_COLUMNS named constant
 *
 * Why: column lists must be (1) statically analyzable for grep / review,
 * (2) literal so Supabase can infer the row shape, (3) never silently grow
 * on schema additions. For column-level access control, use Postgres views
 * (`from("posts_public")`).
 */

const COLUMNS_NAME = /^[A-Z][A-Z0-9_]*_COLUMNS$/;

export const supabaseSelectTypedColumnsRule = {
  meta: {
    type: "problem",
    messages: {
      noArgs:
        "Empty `.select()` returns all columns implicitly. Pass a string literal or a `*_COLUMNS` constant.",
      wildcard:
        '`.select("*")` exposes new schema columns silently. Enumerate columns explicitly.',
      template:
        "Template literal in `.select()` defeats type inference. Use a string literal or a `*_COLUMNS` constant.",
      shapeArg:
        "`.select()` argument must be a string literal or a `*_COLUMNS` identifier.",
      naming:
        "Column constant `{{ name }}` must be UPPER_SNAKE_CASE ending with `_COLUMNS` (e.g. POST_DETAIL_COLUMNS).",
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

        if (arg.type === "Literal") {
          if (typeof arg.value !== "string") {
            context.report({ node: arg, messageId: "shapeArg" });
            return;
          }
          if (arg.value.trim() === "*") {
            context.report({ node: arg, messageId: "wildcard" });
          }
          return;
        }

        if (arg.type === "TemplateLiteral") {
          context.report({ node: arg, messageId: "template" });
          return;
        }

        if (arg.type === "Identifier") {
          if (!COLUMNS_NAME.test(arg.name)) {
            context.report({
              node: arg,
              messageId: "naming",
              data: { name: arg.name },
            });
          }
          return;
        }

        context.report({ node: arg, messageId: "shapeArg" });
      },
    };
  },
};
