import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findProjectRoot() {
  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (
      fs.existsSync(path.join(dir, "package.json")) &&
      !dir.includes("/node_modules/")
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();

const EXCLUDE_LIST = ["proxy.ts", "types"];

function generatePrefixLibMapping() {
  const libDir = path.join(PROJECT_ROOT, "src/lib");
  const mapping = {};

  if (!fs.existsSync(libDir)) {
    return mapping;
  }

  const entries = fs.readdirSync(libDir, { withFileTypes: true });

  for (const entry of entries) {
    if (EXCLUDE_LIST.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      const subDir = path.join(libDir, entry.name);
      const subEntries = fs.readdirSync(subDir, { withFileTypes: true });

      for (const subEntry of subEntries) {
        if (
          subEntry.isFile() &&
          subEntry.name.endsWith(".ts") &&
          !EXCLUDE_LIST.includes(subEntry.name)
        ) {
          const prefix = subEntry.name.replace(".ts", "");
          mapping[prefix] = `@/lib/${entry.name}/${prefix}`;
        }
      }
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      const prefix = entry.name.replace(".ts", "");
      mapping[prefix] = `@/lib/${prefix}`;
    }
  }

  return mapping;
}

export const PREFIX_LIB_MAPPING = generatePrefixLibMapping();

export const featuresGlob = (featureRoot, subpath) => [
  `${featureRoot}/${subpath}`,
];
