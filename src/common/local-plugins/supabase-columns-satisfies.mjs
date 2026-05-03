/**
 * Enforce `<string literal> as const` for `*_COLUMNS` constant declarations.
 *
 * Apply to `**\/queries/*.query.ts` and `**\/constants/*.constant.ts`.
 *
 * `*_COLUMNS` 定数は Supabase の `.select()` に直接渡される。`as const` を
 * 外すと TypeScript が `string` に widen し、Supabase の `.select<Query>()`
 * が literal を parse できなくなって row 型推論が壊れる（戻り値が
 * `GenericStringError` になる）。
 *
 * Allowed:
 *   const POST_DETAIL_COLUMNS = "id,url,platform" as const;
 *
 * Banned:
 *   const POST_DETAIL_COLUMNS = "id,url,platform";              // string に widen
 *   const POST_DETAIL_COLUMNS = ["id", "url"] as const;         // 配列
 *   const POST_DETAIL_COLUMNS = [...] as const satisfies ...;   // 配列 + satisfies
 *   const POST_DETAIL_COLUMNS = `id,${col}`;                    // template literal
 *
 * Why: シンプルな string literal を `as const` で保つだけで、Supabase の
 * 型推論（row 型 / column 名タイポ検出）はすべて自動で効く。runtime helper
 * （`joinColumns` 等）は不要。
 */

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
        'Column constant `{{ name }}` must be `"<comma-separated columns>" as const`. `as const` を外すと Supabase の `.select()` 型推論が壊れる。配列 / template literal も不可。',
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
