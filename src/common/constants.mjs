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

/**
 * Files / basenames that should never become a prefix:
 *
 * - `types.ts` / `type.ts`: 型定義のみで lib の役割を持たない (単複どちらの命名でも除外)
 * - `proxy.ts`: middleware adapter (Next.js の proxy.ts と意味が衝突するため queries から呼ばせない)
 */
const EXCLUDE_LIST = ["types.ts", "type.ts", "proxy.ts"];

/**
 * Scan lib directory and build prefix-to-lib-relative-path mapping:
 *
 * - single-client lib (`lib/<dir>/index.ts`): prefix = dir 名、entry のみ登録 — 同 dir 内の他ファイル (parser 等 sub-module) は自動除外
 * - multi-client lib (index.ts なし): dir 内の全 `<role>.ts` を登録 (e.g., supabase の admin / server / client)
 * - 多重拡張子 (`.test.ts` 等) を持つファイルは sub-module / 非 lib として除外
 * - types.ts / type.ts / proxy.ts のような lib として queries から呼ばせたくないものは EXCLUDE_LIST で除外
 */
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
        // single-client lib: index.ts を entry とみなし、prefix = dir 名で登録
        // 同 dir 内の他ファイル (parser 等) は sub-module として自動除外
        mapping[entry.name] = `${entry.name}/index`;
      } else {
        // multi-client lib: 全 role file を登録 (e.g., supabase の admin / server / client)
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

/** Build glob patterns scoped to the given feature root. */
export const featuresGlob = (featureRoot, subpath) => [
  `${featureRoot}/${subpath}`,
];
