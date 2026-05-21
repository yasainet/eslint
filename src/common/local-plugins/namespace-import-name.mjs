const LAYER_DIR_MAP = {
  queries: "Query",
  services: "Service",
  domains: "Domain",
  entries: "Entry",
  utils: "Util",
  types: "Type",
  schemas: "Schema",
  constants: "Constant",
};

function toCamelCase(str) {
  return str.replace(/[-_]+(.)/g, (_, c) => c.toUpperCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function parseImportSource(importPath, featureRoot) {
  let normalized = importPath;
  const aliasBase = featureRoot.replace(/^src\//, "@/");
  if (normalized.startsWith(aliasBase + "/")) {
    normalized = featureRoot + normalized.slice(aliasBase.length);
  }

  const rootPrefix = featureRoot + "/";
  const rootIdx = normalized.indexOf(rootPrefix);
  if (rootIdx === -1) return null;

  const afterRoot = normalized.slice(rootIdx + rootPrefix.length);
  const segments = afterRoot.split("/");
  if (segments.length < 3) return null;

  const featureDir = segments[0];
  const layerDir = segments[1];
  const scope = segments[segments.length - 1].replace(/\.[jt]sx?$/, "");

  const layer = LAYER_DIR_MAP[layerDir];
  if (!layer) return null;

  return { featureDir, scope, layer };
}

function buildExpectedName(featureDir, scope, layer) {
  const featureCamel = toCamelCase(featureDir);
  const scopePascal = toPascalCase(scope);

  return featureCamel + scopePascal + layer;
}

export const namespaceImportNameRule = {
  meta: {
    type: "suggestion",
    messages: {
      mismatch:
        "Namespace import should be named '{{ expected }}' instead of '{{ actual }}'.",
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

    return {
      ImportDeclaration(node) {
        const nsSpecifier = node.specifiers.find(
          (s) => s.type === "ImportNamespaceSpecifier",
        );
        if (!nsSpecifier) return;

        const importPath = node.source.value;

        if (
          !importPath.startsWith("./") &&
          !importPath.startsWith("../") &&
          !importPath.startsWith("@/")
        ) {
          return;
        }

        let resolvedPath = importPath;
        if (importPath.startsWith(".")) {
          const fileDir = context.filename.replace(/\/[^/]+$/, "");
          const parts = [...fileDir.split("/"), ...importPath.split("/")];
          const resolved = [];
          for (const p of parts) {
            if (p === "..") resolved.pop();
            else if (p !== ".") resolved.push(p);
          }
          resolvedPath = resolved.join("/");
        }

        const parsed = parseImportSource(resolvedPath, featureRoot);
        if (!parsed) return;

        const { featureDir, scope, layer } = parsed;
        const expected = buildExpectedName(featureDir, scope, layer);
        const actual = nsSpecifier.local.name;

        if (actual !== expected) {
          context.report({
            node: nsSpecifier,
            messageId: "mismatch",
            data: { expected, actual },
          });
        }
      },
    };
  },
};
