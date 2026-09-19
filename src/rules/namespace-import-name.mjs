const FEATURES_PREFIX = "@/features/";

function toCamelCase(importPath) {
  return importPath
    .slice(FEATURES_PREFIX.length)
    .split(/[/-]/)
    .filter(Boolean)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join("");
}

export default {
  meta: {
    type: "problem",
    messages: {
      mismatch:
        "namespace import cannot use the name '{{ actual }}'. It can use only '{{ expected }}' (from '{{ importPath }}').",
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== "string") return;
        if (!importPath.startsWith(FEATURES_PREFIX)) return;

        const specifier = node.specifiers.find(
          (s) => s.type === "ImportNamespaceSpecifier",
        );
        if (!specifier) return;

        const expected = toCamelCase(importPath);
        const actual = specifier.local.name;

        if (actual !== expected) {
          context.report({
            node: specifier,
            messageId: "mismatch",
            data: { actual, expected, importPath },
          });
        }
      },
    };
  },
};
