const COLUMNS_NAME = /^[A-Z][A-Z0-9_]*_COLUMNS$/;

export const supabaseSelectTypedColumnsRule = {
  meta: {
    type: "problem",
    messages: {
      noArgs:
        "空の `.select()` は全列を暗黙取得する。文字列リテラルか `*_COLUMNS` 定数を渡す。",
      wildcard:
        '`.select("*")` はスキーマ拡張時に列を暗黙露出する。列を明示列挙する。',
      template:
        "`.select()` の template literal は型推論を壊す。文字列リテラルか `*_COLUMNS` 定数を使う。",
      shapeArg:
        "`.select()` の引数は文字列リテラルか `*_COLUMNS` 識別子にする。",
      naming:
        "column 定数 `{{ name }}` は `_COLUMNS` で終わる UPPER_SNAKE_CASE にする (例 POST_DETAIL_COLUMNS)。",
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
