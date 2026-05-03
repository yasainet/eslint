/**
 * Enforce `[...] as const satisfies readonly (keyof Tables<"...">)[]` for
 * `*_COLUMNS` constant declarations.
 *
 * Apply to `**\/queries/*.query.ts`. Without `as const satisfies`, typos
 * in column names slip past the lint phase — Supabase only complains at
 * runtime when the query executes. The `satisfies` annotation forces
 * TypeScript to validate every entry against the schema before the code
 * ever runs. The actual `keyof Tables<"...">` content is left to the type
 * checker; the lint rule only verifies the syntactic shape.
 */

const COLUMNS_NAME = /^[A-Z][A-Z0-9_]*_COLUMNS$/;

/** Unwrap nested type assertions and find the underlying expression. */
function unwrapTypeAssertions(node) {
  let current = node;
  while (
    current &&
    (current.type === "TSAsExpression" ||
      current.type === "TSSatisfiesExpression")
  ) {
    current = current.expression;
  }
  return current;
}

function isAsConstSatisfies(initNode) {
  if (!initNode) return false;
  if (initNode.type !== "TSSatisfiesExpression") return false;
  const inner = initNode.expression;
  if (inner.type !== "TSAsExpression") return false;
  const ann = inner.typeAnnotation;
  if (!ann) return false;
  if (ann.type !== "TSTypeReference") return false;
  if (ann.typeName.type !== "Identifier") return false;
  if (ann.typeName.name !== "const") return false;
  if (inner.expression.type !== "ArrayExpression") return false;
  return true;
}

export const supabaseColumnsSatisfiesRule = {
  meta: {
    type: "problem",
    messages: {
      missing:
        'Column constant `{{ name }}` must use `[...] as const satisfies readonly (keyof Tables<"table">)[]` so column names are validated against the schema at compile time.',
    },
    schema: [],
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier") return;
        if (!COLUMNS_NAME.test(node.id.name)) return;
        // Only enforce on array initializers. String literals like
        // POST_UPSERT_CONFLICT_COLUMNS are PostgREST conflict-target specs,
        // not column lists, and are out of scope.
        const inner = unwrapTypeAssertions(node.init);
        if (!inner || inner.type !== "ArrayExpression") return;
        if (isAsConstSatisfies(node.init)) return;
        context.report({
          node: node.id,
          messageId: "missing",
          data: { name: node.id.name },
        });
      },
    };
  },
};
