import { dirname, sep } from "node:path";

/**
 * 祖先ディレクトリを遡り、resolve(dir) が truthy を返した値を返す。
 * node_modules 配下 (path segment 判定) は skip。
 * root まで到達しても見つからなければ fallback を返す。
 */
export function findUp(start, resolve, fallback) {
  let dir = start;
  while (dir !== dirname(dir)) {
    if (!dir.split(sep).includes("node_modules")) {
      const found = resolve(dir);
      if (found) return found;
    }
    dir = dirname(dir);
  }
  return fallback;
}
