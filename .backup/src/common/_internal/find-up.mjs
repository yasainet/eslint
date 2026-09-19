import { dirname, sep } from "node:path";

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
