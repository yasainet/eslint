/**
 * Enforce namespace imports for `queries/*.query.ts` files.
 *
 * Value imports must use `import * as xxxQuery from "..."` so that the
 * `naming/namespace-import-name` rule can guarantee a single canonical
 * binding (e.g. `comicsServerQuery.getComics`). Type-only imports are
 * exempted because they have no runtime presence.
 */

const QUERIES_PATH = /\/queries\/[^/]+\.query$/;

export const queriesNamespaceImportRule = {
  meta: {
    type: "problem",
    messages: {
      useNamespace:
        'Use `import * as xxxQuery from "{{ source }}"` instead of named imports for queries layer. Type-only imports (`import type {}`) are allowed.',
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (typeof node.source.value !== "string") return;
        if (!QUERIES_PATH.test(node.source.value)) return;
        if (node.importKind === "type") return;

        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier") continue;
          if (specifier.importKind === "type") continue;
          context.report({
            node: specifier,
            messageId: "useNamespace",
            data: { source: node.source.value },
          });
        }
      },
    };
  },
};
