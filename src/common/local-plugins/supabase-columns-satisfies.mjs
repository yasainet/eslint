const COLUMNS_NAME = /^[A-Z][A-Z0-9_]*_COLUMNS$/;

function isStringAsConst(initNode) {
  if (!initNode) return false;
  if (initNode.type !== "TSAsExpression") return false;
  const ann = initNode.typeAnnotation;
  if (!ann || ann.type !== "TSTypeReference") return false;
  if (ann.typeName.type !== "Identifier") return false;
  if (ann.typeName.name !== "const") return false;
  const inner = initNode.expression;
  if (inner.type !== "Literal") return false;
  return typeof inner.value === "string";
}

export const supabaseColumnsSatisfiesRule = {
  meta: {
    type: "problem",
    messages: {
      shape:
        'column 定数 `{{ name }}` は `"<comma-separated columns>" as const` にする。`as const` を外すと Supabase の `.select()` 型推論が壊れる。配列 / template literal も不可。',
    },
    schema: [],
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier") return;
        if (!COLUMNS_NAME.test(node.id.name)) return;
        if (!node.init) return;
        if (isStringAsConst(node.init)) return;
        context.report({
          node: node.id,
          messageId: "shape",
          data: { name: node.id.name },
        });
      },
    };
  },
};
