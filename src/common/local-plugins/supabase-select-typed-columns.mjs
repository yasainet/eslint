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
