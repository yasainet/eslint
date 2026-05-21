import path from "path";

export const importPathStyleRule = {
  meta: {
    type: "problem",
    messages: {
      useRelative:
        "Same-feature import must use a relative path instead of '{{ importPath }}'.",
      useAlias:
        "Cross-feature import must use '@/' instead of relative path '{{ importPath }}'.",
    },
    schema: [
      {
        type: "object",
        properties: {
          featureRoot: { type: "string" },
        },
        required: ["featureRoot"],
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const { featureRoot } = context.options[0];
    const filename = context.filename;

    const rootSep = featureRoot + "/";
    const rootIdx = filename.indexOf(rootSep);
    if (rootIdx === -1) return {};

    const afterRoot = filename.slice(rootIdx + rootSep.length);
    const featureName = afterRoot.split("/")[0];
    if (!featureName) return {};

    const featureDir =
      filename.slice(0, rootIdx + rootSep.length) + featureName;

    const aliasBase = featureRoot.replace(/^src\//, "");
    const sameFeaturePrefix = `@/${aliasBase}/${featureName}/`;
    const sameFeatureExact = `@/${aliasBase}/${featureName}`;

    function check(source) {
      if (!source || typeof source.value !== "string") return;
      const importPath = source.value;

      if (
        importPath.startsWith(sameFeaturePrefix) ||
        importPath === sameFeatureExact
      ) {
        context.report({
          node: source,
          messageId: "useRelative",
          data: { importPath },
        });
        return;
      }

      if (importPath.startsWith(".")) {
        const resolved = path.resolve(path.dirname(filename), importPath);
        if (
          !resolved.startsWith(featureDir + "/") &&
          resolved !== featureDir
        ) {
          context.report({
            node: source,
            messageId: "useAlias",
            data: { importPath },
          });
        }
      }
    }

    return {
      ImportDeclaration(node) {
        check(node.source);
      },
      ExportNamedDeclaration(node) {
        if (node.source) check(node.source);
      },
      ExportAllDeclaration(node) {
        check(node.source);
      },
      ImportExpression(node) {
        if (node.source && node.source.type === "Literal") {
          check(node.source);
        }
      },
    };
  },
};
