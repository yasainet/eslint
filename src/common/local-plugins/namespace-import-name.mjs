/**
 * Enforce consistent naming for `import * as` namespace imports
 * within feature-based architecture.
 *
 * Convention: import * as {featureName}{Scope}{Layer} from "{path}/{scope}.{layerExt}"
 */

/** @type {Record<string, string>} */
const LAYER_MAP = {
  repo: "Repository",
  service: "Service",
  domain: "Domain",
  action: "Action",
  util: "Util",
  type: "Type",
  schema: "Schema",
  constant: "Constant",
};

/** Convert a snake_case or kebab-case string to camelCase. */
function toCamelCase(str) {
  return str.replace(/[-_]+(.)/g, (_, c) => c.toUpperCase());
}

/** Convert a snake_case or kebab-case string to PascalCase. */
function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Parse import source to extract featureName, scope, and layer.
 * Returns null if the source doesn't match the expected pattern.
 */
function parseImportSource(importPath, featureRoot) {
  // Normalize alias: @/features/... → features/...
  let normalized = importPath;
  const aliasBase = featureRoot.replace(/^src\//, "@/");
  if (normalized.startsWith(aliasBase + "/")) {
    normalized = featureRoot + normalized.slice(aliasBase.length);
  }

  // Only process paths within the feature root
  const rootPrefix = featureRoot + "/";
  const rootIdx = normalized.indexOf(rootPrefix);
  if (rootIdx === -1) return null;

  const afterRoot = normalized.slice(rootIdx + rootPrefix.length);
  // Expected: {feature}/{layerDir}/{scope}.{layerExt}
  const segments = afterRoot.split("/");
  if (segments.length < 2) return null;

  const featureDir = segments[0];
  const fileName = segments[segments.length - 1].replace(/\.[jt]sx?$/, "");

  const dotIdx = fileName.indexOf(".");
  if (dotIdx === -1) return null;

  const scope = fileName.slice(0, dotIdx);
  const ext = fileName.slice(dotIdx + 1);

  const layer = LAYER_MAP[ext];
  if (!layer) return null;

  return { featureDir, scope, layer };
}

/** Build the expected namespace import name. */
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
        // Only check namespace imports: import * as Name
        const nsSpecifier = node.specifiers.find(
          (s) => s.type === "ImportNamespaceSpecifier",
        );
        if (!nsSpecifier) return;

        const importPath = node.source.value;

        // Skip external/built-in imports (only check relative and alias)
        if (
          !importPath.startsWith("./") &&
          !importPath.startsWith("../") &&
          !importPath.startsWith("@/")
        ) {
          return;
        }

        // For relative imports, resolve to an absolute-like path for parsing
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
