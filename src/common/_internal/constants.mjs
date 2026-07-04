import fs from "fs";
import path from "path";

import { findUp } from "./find-up.mjs";

const PROJECT_ROOT = findUp(
  import.meta.dirname,
  (dir) => (fs.existsSync(path.join(dir, "package.json")) ? dir : null),
  process.cwd(),
);

const EXCLUDE_LIST = ["types.ts", "proxy.ts", "utils.ts"];

export function generatePrefixLibMapping(featureRoot) {
  const libRoot = featureRoot.replace(/features$/, "lib");
  const libDir = path.join(PROJECT_ROOT, libRoot);
  const mapping = {};

  if (!fs.existsSync(libDir)) {
    return mapping;
  }

  const isPlainTsFile = (name) =>
    name.endsWith(".ts") &&
    name.split(".").length === 2 &&
    !EXCLUDE_LIST.includes(name);

  const entries = fs.readdirSync(libDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = path.join(libDir, entry.name);
      const subEntries = fs.readdirSync(subDir, { withFileTypes: true });
      const plainTsFiles = subEntries
        .filter((e) => e.isFile() && isPlainTsFile(e.name))
        .map((e) => e.name);

      if (plainTsFiles.includes("index.ts")) {
        mapping[entry.name] = `${entry.name}/index`;
      } else {
        for (const fileName of plainTsFiles) {
          const prefix = fileName.replace(/\.ts$/, "");
          mapping[prefix] = `${entry.name}/${prefix}`;
        }
      }
    } else if (entry.isFile() && isPlainTsFile(entry.name)) {
      const prefix = entry.name.replace(/\.ts$/, "");
      mapping[prefix] = prefix;
    }
  }

  return mapping;
}

export const featuresGlob = (featureRoot, subpath) => [
  `${featureRoot}/${subpath}`,
];
