/**
 * Enforce consistent naming for `import * as` namespace imports
 * within feature-based architecture.
 *
 * Convention: import * as {featureName}{Scope}{Layer} from "{path}/{layerDir}/{scope}"
 *
 * Layer はファイル名 suffix ではなくディレクトリ名 (`queries/` / `services/` 等) から識別する。
 */

/** @type {Record<string, string>} */
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
 * Parse import source to extract featureName, scope, and layer:
 *
 * - feature root 内の path のみを対象とする (外部 lib / shared / 相対インポートで feature 外に行くものは無視)
 * - segments は `[feature, layerDir, ..., file]` の形式を想定し、末尾要素を scope として取り出す
 * - layerDir が LAYER_DIR_MAP に無い場合は対象外
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
  // Expected: {feature}/{layerDir}/{scope}
  const segments = afterRoot.split("/");
  if (segments.length < 3) return null;

  const featureDir = segments[0];
  const layerDir = segments[1];
  const scope = segments[segments.length - 1].replace(/\.[jt]sx?$/, "");

  const layer = LAYER_DIR_MAP[layerDir];
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
