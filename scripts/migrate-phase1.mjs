#!/usr/bin/env node
/**
 * Phase 1 migration: repositories/ → queries/, actions/ → interactors/
 *
 * Run from a consuming project root:
 *   node ~/Projects/eslint/scripts/migrate-phase1.mjs           # dry-run
 *   node ~/Projects/eslint/scripts/migrate-phase1.mjs --apply   # apply
 *
 * What it does:
 *
 * - Renames `{features}/{feature}/repositories/` → `queries/`
 * - Renames `{features}/{feature}/actions/` → `interactors/`
 * - Renames `*.repo.ts` → `*.query.ts`, `*.action.ts` → `*.interactor.ts`
 * - Rewrites import paths and namespace variable names across the project
 *
 * The default features root is `src/features`. Override with `--dir`.
 */

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    dir: { type: "string", default: "src/features" },
    apply: { type: "boolean", default: false },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help) {
  console.log(`Phase 1 migration: repositories/actions → queries/interactors

Usage:
  node migrate-phase1.mjs [--dir <features-root>] [--apply]

Options:
  --dir       Features root (default: src/features)
  --apply     Apply changes (default: dry-run)
  --help, -h  Show this help`);
  process.exit(0);
}

const cwd = process.cwd();
const featuresRoot = path.resolve(cwd, values.dir);

if (!fs.existsSync(featuresRoot)) {
  console.error(`✗ Features root not found: ${featuresRoot}`);
  process.exit(1);
}

const isApply = values.apply;
console.log(`Mode: ${isApply ? "APPLY" : "DRY-RUN"}`);
console.log(`Features root: ${path.relative(cwd, featuresRoot)}`);

const RENAME_MAP = {
  repositories: { newDir: "queries", oldExt: ".repo.ts", newExt: ".query.ts" },
  actions: { newDir: "interactors", oldExt: ".action.ts", newExt: ".interactor.ts" },
};

// 1. Collect rename operations
const renames = [];

function collectRenames(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);

    const map = RENAME_MAP[entry.name];
    if (map) {
      const newDirPath = path.join(dir, map.newDir);
      renames.push({ kind: "dir", from: full, to: newDirPath });

      // After dir rename, files will live in newDirPath
      const files = fs.readdirSync(full);
      for (const f of files) {
        if (f.endsWith(map.oldExt)) {
          const newName = f.slice(0, -map.oldExt.length) + map.newExt;
          renames.push({
            kind: "file",
            from: path.join(newDirPath, f),
            to: path.join(newDirPath, newName),
          });
        }
      }
    } else {
      collectRenames(full);
    }
  }
}

collectRenames(featuresRoot);

console.log(`\n=== Renames (${renames.length}) ===`);
for (const r of renames) {
  const from = path.relative(cwd, r.from);
  const to = path.relative(cwd, r.to);
  console.log(`  ${r.kind.padEnd(4)} ${from} → ${to}`);
}

// 2. Collect content rewrites
const TS_EXTS = new Set([".ts", ".tsx", ".mjs", ".js", ".jsx", ".cjs"]);
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  ".vercel",
  "coverage",
  ".turbo",
]);

const allFiles = [];
function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && TS_EXTS.has(path.extname(entry.name))) {
      allFiles.push(full);
    }
  }
}

walk(cwd);

// Common scope prefixes used in namespace imports.
// Required before Repository/Action to avoid false positives like `formAction` (useActionState).
const SCOPES = "Server|Client|Admin|Garage|Stripe|Resend|Discord|Supabase|Storage";

const REPLACEMENTS = [
  // Import path segments (require trailing / or quote to avoid false positives)
  { name: "path:repositories", regex: /\/repositories(\/|['"])/g, to: "/queries$1" },
  { name: "path:actions", regex: /\/actions(\/|['"])/g, to: "/interactors$1" },
  // File extensions inside import strings
  { name: "ext:.repo", regex: /\.repo(['"])/g, to: ".query$1" },
  { name: "ext:.action", regex: /\.action(['"])/g, to: ".interactor$1" },
  // Namespace variable suffixes: require {feature}{Scope}{Layer} pattern.
  // e.g. comicsServerRepository → comicsServerQuery, but formAction is left alone.
  {
    name: "var:Repository",
    regex: new RegExp(`\\b([a-z][a-zA-Z0-9]*?)(${SCOPES})Repository\\b`, "g"),
    to: "$1$2Query",
  },
  {
    name: "var:Action",
    regex: new RegExp(`\\b([a-z][a-zA-Z0-9]*?)(${SCOPES})Action\\b`, "g"),
    to: "$1$2Interactor",
  },
];

const changes = [];
const totals = {};

for (const file of allFiles) {
  const original = fs.readFileSync(file, "utf-8");
  let next = original;
  const stats = {};
  for (const r of REPLACEMENTS) {
    const matches = next.match(r.regex);
    if (matches) {
      stats[r.name] = matches.length;
      totals[r.name] = (totals[r.name] || 0) + matches.length;
      next = next.replace(r.regex, r.to);
    }
  }
  if (next !== original) {
    changes.push({ file, next, stats });
  }
}

console.log(`\n=== Content changes (${changes.length} files) ===`);
for (const [k, v] of Object.entries(totals)) {
  console.log(`  ${k.padEnd(20)} ${v} occurrences`);
}

console.log(`\nFirst 20 affected files:`);
for (const c of changes.slice(0, 20)) {
  const counts = Object.entries(c.stats)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  console.log(`  ${path.relative(cwd, c.file).padEnd(60)} ${counts}`);
}
if (changes.length > 20) {
  console.log(`  ... and ${changes.length - 20} more`);
}

// 3. Apply
if (!isApply) {
  console.log(`\nDry-run complete. Use --apply to actually apply changes.`);
  process.exit(0);
}

console.log(`\n=== Applying ===`);

for (const c of changes) {
  fs.writeFileSync(c.file, c.next);
}
console.log(`✓ Rewrote ${changes.length} files`);

for (const r of renames) {
  fs.renameSync(r.from, r.to);
}
console.log(`✓ Renamed ${renames.length} entries`);

console.log(`\nDone. Verify with: npm install && npm run lint && npm run type-check`);
