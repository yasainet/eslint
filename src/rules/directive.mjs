export default {
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      required:
        '{{ layer }} cannot start without "{{ directive }}". The first line can be only "{{ directive }}".',
      forbidden:
        '{{ layer }} cannot use "{{ directive }}". Only {{ owner }} can use "{{ directive }}".',
    },
    schema: [
      {
        type: "object",
        properties: {
          layer: { type: "string" },
          required: { type: "string" },
          forbidden: {
            type: "object",
            properties: {
              directive: { type: "string" },
              owner: { type: "string" },
            },
            required: ["directive", "owner"],
            additionalProperties: false,
          },
        },
        required: ["layer"],
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const { layer, required, forbidden } = context.options[0];

    return {
      Program(node) {
        if (!required) return;
        if (node.body[0]?.directive === required) return;

        context.report({
          node: node.body[0] ?? node,
          messageId: "required",
          data: { layer, directive: required },
          fix: (fixer) =>
            fixer.insertTextBeforeRange([0, 0], `"${required}";\n\n`),
        });
      },
      ExpressionStatement(node) {
        if (!forbidden) return;
        if (node.directive !== forbidden.directive) return;

        context.report({
          node,
          messageId: "forbidden",
          data: { layer, ...forbidden },
        });
      },
    };
  },
};
