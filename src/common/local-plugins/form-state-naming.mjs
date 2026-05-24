const FORM_STATE_ALLOW = /^[A-Z][a-z]+[A-Z]\w*FormState$/;

function reportIfInvalid(context, idNode) {
  const name = idNode.name;
  if (!name.endsWith("FormState")) return;
  if (FORM_STATE_ALLOW.test(name)) return;
  context.report({
    node: idNode,
    messageId: "invalidName",
    data: { name },
  });
}

export const formStateNamingRule = {
  meta: {
    type: "problem",
    messages: {
      invalidName:
        "FormState 型 '{{ name }}' は {Verb}{Subject}FormState 形式にする (例 CreateCommentFormState, SignInFormState)。PascalCase 2 語以上が必須。",
    },
    schema: [],
  },
  create(context) {
    return {
      TSInterfaceDeclaration(node) {
        if (node.id) reportIfInvalid(context, node.id);
      },
      TSTypeAliasDeclaration(node) {
        if (node.id) reportIfInvalid(context, node.id);
      },
    };
  },
};
