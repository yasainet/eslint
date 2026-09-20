const FILE_PATTERN =
  /\/src\/features\/([^/]+)\/(schemas|types|utils)\/([^/.]+)\.[^/]+$/;

export default {
  meta: {
    type: "problem",
    messages: {
      invalidFileName:
        "{{ layer }} cannot use the file name '{{ name }}'. It can use only the feature name ('{{ feature }}').",
    },
    schema: [],
  },
  create(context) {
    const match = FILE_PATTERN.exec(context.filename);
    if (!match) return {};

    const [, feature, layer, name] = match;
    if (name === feature) return {};

    return {
      Program: (node) =>
        context.report({
          node,
          messageId: "invalidFileName",
          data: { layer, name, feature },
        }),
    };
  },
};
