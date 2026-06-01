#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

// pure layer (schemas / utils) の unit test presence と、entries を持つ feature の
// e2e presence を機械チェックする:
//
// - unit: 各 source に 兄弟 *.test.ts が存在するか、`@unit-exempt:` marker を持つことを要求
//   - schemas は定義上 pure。utils は impure 混在のため marker で opt-out できる
// - e2e: entries/ を持つ feature ごとに tests/e2e/<feature>/*.spec.ts の存在を要求
//   - 配線 (entries) は unit でなく e2e で疎通を担保する方針の存在チェック
// - ESLint の per-file モデルと噛み合わない「存在強制」を全ツリー一括監査で担う

const REQUIRE_DIRS = new Set(["schemas", "utils"]);
const EXEMPT_RE = /@unit-exempt:/;
const E2E_ROOT = "tests/e2e";

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

/** pure layer (schemas / utils) の unit test 不在を列挙する */
function auditUnit(projectRoot, featuresDir) {
  const violations = [];
  for (const file of walk(featuresDir)) {
    if (isTarget(file) && !isSatisfied(file)) {
      violations.push(path.relative(projectRoot, file));
    }
  }
  return violations.sort();
}

/** entries/ を持つ feature ごとに対応する e2e spec の不在を列挙する */
function auditE2e(projectRoot, featureRoot, featuresDir) {
  if (!fs.existsSync(featuresDir)) {
    return [];
  }
  const violations = [];
  for (const entry of fs.readdirSync(featuresDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const feature = entry.name;
    const hasEntries = fs.existsSync(path.join(featuresDir, feature, "entries"));
    if (!hasEntries) {
      continue;
    }
    const e2eDir = path.join(projectRoot, E2E_ROOT, feature);
    const hasSpec = [...walk(e2eDir)].some((f) => f.endsWith(".spec.ts"));
    if (!hasSpec) {
      violations.push(
        `${featureRoot}/${feature}/entries → ${E2E_ROOT}/${feature}/*.spec.ts`,
      );
    }
  }
  return violations.sort();
}

function main() {
  const argv = process.argv.slice(2);

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(
      "test-audit — pure layer の unit test と feature の e2e presence を検査\n\n" +
        "Usage: test-audit [--feature-root <path>]\n\n" +
        "  --feature-root <path>  feature root (default: src/features)\n\n" +
        "  unit: 各 schemas/*.ts と utils/*.ts に 兄弟 *.test.ts または\n" +
        "        `// @unit-exempt: <理由>` marker を要求する。\n" +
        "  e2e:  entries/ を持つ feature ごとに\n" +
        "        tests/e2e/<feature>/*.spec.ts を要求する。",
    );
    process.exit(0);
  }

  const projectRoot = process.cwd();
  const featureRoot = getFlag(argv, "--feature-root") ?? "src/features";
  const featuresDir = path.join(projectRoot, featureRoot);

  const unitViolations = auditUnit(projectRoot, featuresDir);
  const e2eViolations = auditE2e(projectRoot, featureRoot, featuresDir);

  let failed = false;

  if (unitViolations.length > 0) {
    failed = true;
    console.error(
      `✗ test-audit(unit): ${unitViolations.length} 件の pure layer に unit test も @unit-exempt marker もありません:\n`,
    );
    for (const v of unitViolations) {
      console.error(`  ${v}`);
    }
    console.error(
      "\n対応: 兄弟 *.test.ts を追加するか、impure な場合は\n" +
        "`// @unit-exempt: <理由>` を記載する。\n",
    );
  }

  if (e2eViolations.length > 0) {
    failed = true;
    console.error(
      `✗ test-audit(e2e): ${e2eViolations.length} 件の feature に対応する e2e spec がありません:\n`,
    );
    for (const v of e2eViolations) {
      console.error(`  ${v}`);
    }
    console.error(
      "\n対応: tests/e2e/<feature>/*.spec.ts を追加する\n" +
        "(配線の疎通は e2e で担保する)。\n",
    );
  }

  if (failed) {
    process.exit(1);
  }

  console.log(
    "✓ test-audit: schemas / utils の unit と entries feature の e2e はすべて揃っています。",
  );
}

main();
