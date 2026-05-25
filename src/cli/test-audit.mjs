#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

// pure layer (schemas / utils) の unit test presence を機械チェックする:
//
// - 各 source に 兄弟 *.test.ts が存在するか、`@unit-exempt:` marker を持つことを要求
// - schemas は定義上 pure。utils は impure 混在のため marker で opt-out できる
// - ESLint の per-file モデルと噛み合わない「存在強制」を全ツリー一括監査で担う

const REQUIRE_DIRS = new Set(["schemas", "utils"]);
const EXEMPT_RE = /@unit-exempt:/;

function getFlag(argv, name) {
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : null;
}

function* walk(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function isTarget(file) {
  if (!file.endsWith(".ts")) {
    return false;
  }
  if (file.endsWith(".test.ts") || file.endsWith(".d.ts")) {
    return false;
  }
  return REQUIRE_DIRS.has(path.basename(path.dirname(file)));
}

function isSatisfied(file) {
  const testFile = file.replace(/\.ts$/, ".test.ts");
  if (fs.existsSync(testFile)) {
    return true;
  }
  return EXEMPT_RE.test(fs.readFileSync(file, "utf8"));
}

function main() {
  const argv = process.argv.slice(2);

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(
      "test-audit — pure layer (schemas/utils) の unit test presence を検査\n\n" +
        "Usage: test-audit [--feature-root <path>]\n\n" +
        "  --feature-root <path>  feature root (default: src/features)\n\n" +
        "各 schemas/*.ts と utils/*.ts に 兄弟 *.test.ts または\n" +
        "`// @unit-exempt: <理由>` marker を要求する。",
    );
    process.exit(0);
  }

  const projectRoot = process.cwd();
  const featureRoot = getFlag(argv, "--feature-root") ?? "src/features";
  const roots = [path.join(projectRoot, featureRoot)];

  const violations = [];
  for (const root of roots) {
    for (const file of walk(root)) {
      if (isTarget(file) && !isSatisfied(file)) {
        violations.push(path.relative(projectRoot, file));
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      `✗ test-audit: ${violations.length} 件の pure layer に unit test も @unit-exempt marker もありません:\n`,
    );
    for (const v of violations.sort()) {
      console.error(`  ${v}`);
    }
    console.error(
      "\n対応: 兄弟 *.test.ts を追加するか、impure な場合は\n" +
        "`// @unit-exempt: <理由>` を記載する。",
    );
    process.exit(1);
  }

  console.log(
    "✓ test-audit: schemas / utils はすべて unit test または @unit-exempt が揃っています。",
  );
}

main();
