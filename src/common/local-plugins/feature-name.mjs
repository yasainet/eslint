import fs from "fs";
import path from "path";

function extractTableNames(supabaseTypePath) {
  if (!fs.existsSync(supabaseTypePath)) {
    return [];
  }

  const content = fs.readFileSync(supabaseTypePath, "utf-8");

  const publicMatch = /(?<!\w)public:\s*\{/.exec(content);
  if (!publicMatch) {
    return [];
  }

  const tablesLabel = "Tables:";
  const tablesIdx = content.indexOf(tablesLabel, publicMatch.index);
  if (tablesIdx === -1) {
    return [];
  }

  const braceStart = content.indexOf("{", tablesIdx + tablesLabel.length);
  if (braceStart === -1) {
    return [];
  }

  let depth = 0;
  let blockEnd = -1;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") depth--;
    if (depth === 0) {
      blockEnd = i;
      break;
    }
  }
  if (blockEnd === -1) {
    return [];
  }

  const tablesBlock = content.slice(braceStart + 1, blockEnd);
  const names = [];
  depth = 0;
  const keyRegex = /(\w+)\s*:/g;
  let match;
  while ((match = keyRegex.exec(tablesBlock)) !== null) {
    const preceding = tablesBlock.slice(0, match.index);
    let d = 0;
    for (const ch of preceding) {
      if (ch === "{") d++;
      else if (ch === "}") d--;
    }
    if (d === 0) {
      names.push(match[1]);
    }
  }
  return names;
}

function toKebab(name) {
  return name.replace(/_/g, "-");
}

export const featureNameRule = {
  meta: {
    type: "problem",
    messages: {
      invalidFeatureName:
        "feature directory '{{ name }}' は許可されない。許可: {{ allowed }}。",
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
    const candidateTypePaths = [
      path.join(
        projectRoot,
        featureRoot.replace(/features$/, "lib/supabase/types.ts"),
      ),
      path.join(projectRoot, "src/lib/supabase/types.ts"),
    ];
    const supabaseTypePath =
      candidateTypePaths.find((p) => fs.existsSync(p)) ?? candidateTypePaths[0];

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
