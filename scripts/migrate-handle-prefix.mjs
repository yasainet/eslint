#!/usr/bin/env node
/**
 * Remove `handle*` prefix from interactor function names.
 *
 * Phase 1 follow-up: Phase 1 dropped the lint rule that required `handle*`,
 * but consuming projects still have `handleGetComics` etc. in their code.
 * This script renames them safely.
 *
 * Strategy:
 *
 * - Scan all `**\/interactors\/*.interactor.ts` files in the project
 * - Find `export async function handle{X}` declarations
 * - Build a specific rename mapping (e.g. handleGetComics → getComics)
 * - Apply the mapping project-wide using \b boundaries
 *
 * Safety: only renames identifiers that match actual interactor exports.
 * DOM event handlers (handleSubmit, handleClick) are untouched.
 *
 * Usage:
 *   node ~/Projects/eslint/scripts/migrate-handle-prefix.mjs           # dry-run
 *   node ~/Projects/eslint/scripts/migrate-handle-prefix.mjs --apply   # apply
 */

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    apply: { type: "boolean", default: false },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help) {
  console.log(`Usage: node migrate-handle-prefix.mjs [--apply]`);
  process.exit(0);
}

const cwd = process.cwd();
const isApply = values.apply;

console.log(`Mode: ${isApply ? "APPLY" : "DRY-RUN"}`);
console.log(`Project root: ${cwd}`);

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

// 1. Walk project to find all files
const allFiles = [];
const interactorFiles = [];

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
      if (full.includes("/interactors/") && entry.name.endsWith(".interactor.ts")) {
        interactorFiles.push(full);
      }
    }
  }
}

walk(cwd);

console.log(`\nInteractor files found: ${interactorFiles.length}`);

// 2. Collect handle* exports from interactor files
const renames = new Map(); // oldName → newName
const HANDLE_EXPORT = /export\s+(?:async\s+)?function\s+(handle[A-Z][a-zA-Z0-9]*)/g;

for (const file of interactorFiles) {
  const content = fs.readFileSync(file, "utf-8");
  let m;
  HANDLE_EXPORT.lastIndex = 0;
  while ((m = HANDLE_EXPORT.exec(content)) !== null) {
    const old = m[1];
    if (renames.has(old)) continue;
    const stripped = old.slice("handle".length);
    const newName = stripped[0].toLowerCase() + stripped.slice(1);
    renames.set(old, newName);
  }
}

console.log(`\n=== Rename mapping (${renames.size}) ===`);
const sorted = [...renames.entries()].sort();
for (const [oldName, newName] of sorted) {
  console.log(`  ${oldName.padEnd(45)} → ${newName}`);
}

if (renames.size === 0) {
  console.log(`\nNo handle* exports found. Nothing to do.`);
  process.exit(0);
}

// 3. Apply rename across all files
const changes = [];
for (const file of allFiles) {
  const original = fs.readFileSync(file, "utf-8");
  let next = original;
  let totalCount = 0;
  const stats = {};
  for (const [oldName, newName] of renames) {
    const re = new RegExp(`\\b${oldName}\\b`, "g");
    const matches = next.match(re);
    if (matches) {
      totalCount += matches.length;
      stats[oldName] = matches.length;
      next = next.replace(re, newName);
    }
  }
  if (next !== original) {
    changes.push({ file, next, count: totalCount, stats });
  }
}

console.log(`\n=== Affected files (${changes.length}) ===`);
const totalReplacements = changes.reduce((sum, c) => sum + c.count, 0);
console.log(`Total replacements: ${totalReplacements}`);

console.log(`\nFirst 20 affected files:`);
for (const c of changes.slice(0, 20)) {
  console.log(`  ${path.relative(cwd, c.file).padEnd(65)} ${c.count} renames`);
}
if (changes.length > 20) {
  console.log(`  ... and ${changes.length - 20} more`);
}

if (!isApply) {
  console.log(`\nDry-run complete. Use --apply to apply.`);
  process.exit(0);
}

console.log(`\n=== Applying ===`);
for (const c of changes) {
  fs.writeFileSync(c.file, c.next);
}
console.log(`✓ Rewrote ${changes.length} files`);

console.log(`\nDone. Verify with: npm run lint && npm run type-check && npm run build`);
