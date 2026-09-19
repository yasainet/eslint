export const schemaNamingRule = {
  meta: {
    type: "problem",
    messages: {
      missingSuffix:
        "schema file の export 変数 '{{ name }}' は 'Schema' で終える。",
      invalidCasing:
        "export 変数 '{{ name }}' は camelCase にする (小文字始まり)。",
    },
    schema: [],
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration || node.declaration.type !== "VariableDeclaration") {
          return;
        }

        for (const declarator of node.declaration.declarations) {
          const name = declarator.id.name;

          if (!name.endsWith("Schema")) {
            context.report({
              node: declarator.id,
              messageId: "missingSuffix",
              data: { name },
            });
          } else if (name[0] !== name[0].toLowerCase()) {
            context.report({
              node: declarator.id,
              messageId: "invalidCasing",
              data: { name },
            });
          }
        }
      },
    };
  },
};
