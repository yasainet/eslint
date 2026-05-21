const DISALLOWED_TOKEN = /^(?:[pm][xytrbl]?-|space-[xy]-|gap-)/;

function collectStringLiterals(node, out) {
  if (!node) return;
  switch (node.type) {
    case "Literal":
      if (typeof node.value === "string") out.push(node.value);
      return;
    case "TemplateLiteral":
      for (const q of node.quasis) {
        if (typeof q.value.cooked === "string") out.push(q.value.cooked);
      }
      for (const expr of node.expressions) collectStringLiterals(expr, out);
      return;
    case "CallExpression":
      for (const arg of node.arguments) collectStringLiterals(arg, out);
      return;
    case "ConditionalExpression":
      collectStringLiterals(node.consequent, out);
      collectStringLiterals(node.alternate, out);
      return;
    case "LogicalExpression":
    case "BinaryExpression":
      collectStringLiterals(node.left, out);
      collectStringLiterals(node.right, out);
      return;
    case "ArrayExpression":
      for (const el of node.elements) collectStringLiterals(el, out);
      return;
  }
}

function findInvalidTokens(strings) {
  const invalid = [];
  for (const s of strings) {
    for (const token of s.split(/\s+/)) {
      if (token && DISALLOWED_TOKEN.test(token)) {
        invalid.push(token);
      }
    }
  }
  return invalid;
}

export const layoutMainStructuralOnlyRule = {
  meta: {
    type: "problem",
    messages: {
      invalidToken:
        "<main> in layout.tsx must be structural-only. Move spacing/decoration ({{ tokens }}) to page.tsx (e.g. <Container className=\"py-8\">).",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name?.type !== "JSXIdentifier") return;
        if (node.name.name !== "main") return;

        for (const attr of node.attributes) {
          if (attr.type !== "JSXAttribute") continue;
          if (attr.name?.name !== "className") continue;

          const strings = [];
          if (attr.value?.type === "Literal") {
            collectStringLiterals(attr.value, strings);
          } else if (attr.value?.type === "JSXExpressionContainer") {
            collectStringLiterals(attr.value.expression, strings);
          }

          const invalid = findInvalidTokens(strings);
          if (invalid.length > 0) {
            context.report({
              node: attr,
              messageId: "invalidToken",
              data: { tokens: invalid.join(", ") },
            });
          }
        }
      },
    };
  },
};
