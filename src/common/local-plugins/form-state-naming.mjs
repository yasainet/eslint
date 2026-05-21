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
        "FormState type '{{ name }}' must follow {Verb}{Subject}FormState pattern (e.g. CreateCommentFormState, SignInFormState). At least two PascalCase words are required.",
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
