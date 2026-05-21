const QUERIES_PATH = /\/queries\/[^/]+$/;

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
