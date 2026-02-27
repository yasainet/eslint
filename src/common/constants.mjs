import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @description Find the project root by walking up from this package's location in node_modules. */
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

// Root directories containing feature modules
export const FEATURE_ROOTS = [
  "src/features",
  "scripts/features",
  "supabase/functions/features",
];

// Files and directories to exclude from prefix mapping
const EXCLUDE_LIST = ["proxy.ts", "types"];

/** @description Generate PREFIX_LIB_MAPPING by scanning src/lib/ directory. */
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
      // Scan subdirectory (e.g., src/lib/supabase/)
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

// Mapping of file prefixes to lib imports (e.g., server → @/lib/supabase/server)
// Used by naming.mjs (file naming) and imports.mjs (import restrictions)
export const PREFIX_LIB_MAPPING = generatePrefixLibMapping();

/** @description Create glob patterns for all feature roots. */
export const featuresGlob = (subpath) =>
  FEATURE_ROOTS.map((root) => `${root}/${subpath}`);
