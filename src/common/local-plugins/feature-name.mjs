import fs from "fs";
import path from "path";

/**
 * Extract table names from Supabase generated types file.
 * Looks for keys directly under `Tables: {` in the Database interface.
 */
function extractTableNames(supabaseTypePath) {
  if (!fs.existsSync(supabaseTypePath)) {
    return [];
  }

  const content = fs.readFileSync(supabaseTypePath, "utf-8");
  const tablesMatch = content.match(/Tables:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/);
  if (!tablesMatch) {
    return [];
  }

  const tablesBlock = tablesMatch[1];
  const keyRegex = /^\s*(\w+)\s*:/gm;
  const names = [];
  let match;
  while ((match = keyRegex.exec(tablesBlock)) !== null) {
    names.push(match[1]);
  }
  return names;
}

/** Convert snake_case to kebab-case. */
function toKebab(name) {
  return name.replace(/_/g, "-");
}

/**
 * Enforce that feature directory names match allowed values:
 * "shared", "auth", plus Supabase table names converted to kebab-case.
 */
export const featureNameRule = {
  meta: {
    type: "problem",
    messages: {
      invalidFeatureName:
        "Feature directory '{{ name }}' is not allowed. Allowed: {{ allowed }}.",
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

    const projectRoot = filename.slice(0, rootIdx).replace(/\/src$/, "");
    const supabaseTypePath = path.join(
      projectRoot,
      featureRoot.replace(/features$/, "lib/supabase/supabase.type.ts"),
    );

    const tableNames = extractTableNames(supabaseTypePath);
    const allowedNames = ["shared", "auth", ...tableNames.map(toKebab)];

    if (allowedNames.includes(featureName)) return {};

    return {
      Program(node) {
        context.report({
          node,
          messageId: "invalidFeatureName",
          data: {
            name: featureName,
            allowed: allowedNames.join(", "),
          },
        });
      },
    };
  },
};
