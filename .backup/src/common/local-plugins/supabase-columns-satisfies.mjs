const COLUMNS_NAME = /^[A-Z][A-Z0-9_]*_COLUMNS$/;

function isAsConst(initNode) {
  if (!initNode || initNode.type !== "TSAsExpression") return false;
  const ann = initNode.typeAnnotation;
  if (!ann || ann.type !== "TSTypeReference") return false;
  if (ann.typeName.type !== "Identifier") return false;
  return ann.typeName.name === "const";
}

function isAsConstStringLiteral(initNode) {
  if (!isAsConst(initNode)) return false;
  const inner = initNode.expression;
  return inner.type === "Literal" && typeof inner.value === "string";
}

function isLocalAsConstStringRef(identifier, sourceCode) {
  let scope = sourceCode.getScope(identifier);
  while (scope) {
    const variable = scope.set.get(identifier.name);
    if (variable) {
      const def = variable.defs[0];
      if (!def || def.type !== "Variable") return false;
      if (def.parent?.kind !== "const") return false;
      return isAsConstStringLiteral(def.node.init);
    }
    scope = scope.upper;
  }
  return false;
}

/**
 * `*_COLUMNS` 定数の shape を検証し、Supabase `.select()` の型推論を保つ。
 *
 * 許容するのは以下のいずれか:
 * - `"..." as const` (string literal)
 * - `` `${IDENT}, ...` as const `` (template literal で interpolation が
 *   全て **同一 file scope の as const string literal Identifier** であるもの)
 *
 * Why-not type-aware (cross-module 追跡): rule を dumb で機械的に保つため
 * scope manager の参照解決のみで検査する。派生定数を作りたい場合は base 定数と
 * 同じ file に集約する運用とする (詳細: yasainet/eslint#3)。
 */
function isValidShape(initNode, sourceCode) {
  if (!isAsConst(initNode)) return false;
  const inner = initNode.expression;
  if (inner.type === "Literal") return typeof inner.value === "string";
  if (inner.type === "TemplateLiteral") {
    return inner.expressions.every(
      (expr) =>
        expr.type === "Identifier" &&
        isLocalAsConstStringRef(expr, sourceCode),
    );
  }
  return false;
}

export const supabaseColumnsSatisfiesRule = {
  meta: {
    type: "problem",
    messages: {
      shape:
        'column 定数 `{{ name }}` は `"..." as const` か、`` `${BASE}, ...` as const `` で同一 file 内の as const literal を合成する。配列 / 識別子追跡不可能な template literal / 文字列結合は不可。`as const` を外すと Supabase `.select()` の型推論が壊れる。',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;
    return {
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier") return;
        if (!COLUMNS_NAME.test(node.id.name)) return;
        if (!node.init) return;
        if (isValidShape(node.init, sourceCode)) return;
        context.report({
          node: node.id,
          messageId: "shape",
          data: { name: node.id.name },
        });
      },
    };
  },
};
