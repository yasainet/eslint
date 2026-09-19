export default {
  meta: {
    type: "problem",
    messages: {
      noParentImport:
        "import can use only ./ or @/. import cannot use ../ ('{{ importPath }}').",
    },
    schema: [],
  },
  create(context) {
    function check(source) {
      if (!source || typeof source.value !== "string") return;
      const importPath = source.value;

      if (importPath === ".." || importPath.startsWith("../")) {
        context.report({
          node: source,
          messageId: "noParentImport",
          data: { importPath },
        });
      }
    }

    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
    };
  },
};
