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

const EXCLUDE_LIST = ["proxy.lib.ts", "types"];

/** @description Extract the base name from a .ts filename by stripping all extensions. */
function baseName(filename) {
  return filename.replace(/\..*$/, "");
}

/** @description Scan lib directory derived from featureRoot and build prefix-to-lib-relative-path mapping */
export function generatePrefixLibMapping(featureRoot) {
  const libRoot = featureRoot.replace(/features$/, "lib");
  const libDir = path.join(PROJECT_ROOT, libRoot);
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
          const prefix = baseName(subEntry.name);
          mapping[prefix] = `${entry.name}/${subEntry.name.replace(".ts", "")}`;
        }
      }
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      const prefix = baseName(entry.name);
      mapping[prefix] = entry.name.replace(".ts", "");
    }
  }

  return mapping;
}

export const featuresGlob = (featureRoot, subpath) => [
  `${featureRoot}/${subpath}`,
];
