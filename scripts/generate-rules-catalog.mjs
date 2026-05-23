#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const ENTRIES = [
  { name: "next", path: "src/next/index.mjs" },
  { name: "node", path: "src/node/index.mjs" },
  { name: "deno", path: "src/deno/index.mjs" },
];

const SKIP_DIRS = new Set(["_internal", "local-plugins", "node_modules"]);
const SKIP_BASENAMES = new Set(["index.mjs"]);

const SAMPLE_CONTEXT = {
  featureRoot: "src/features",
  prefixLibMapping: {
    server: "supabase/server",
    client: "supabase/client",
    admin: "supabase/admin",
  },
  typeAware: true,
};

const STANDARD_DESCRIPTIONS = {
  "no-console": "console 呼び出しを禁止",
  "no-constant-binary-expression": "定数の二項演算を禁止",
  "no-constant-condition": "定数条件を禁止",
  "no-dupe-else-if": "else-if の重複条件を禁止",
  "no-fallthrough": "switch の fall-through を禁止",
  "no-irregular-whitespace": "不正な空白文字を禁止",
  "no-self-assign": "自己代入を禁止",
  "no-self-compare": "自己比較を禁止",
  "no-unreachable": "到達不能コードを禁止",
  "no-unreachable-loop": "到達不能ループを禁止",
  "no-useless-catch": "無意味な catch を禁止",
  "no-useless-return": "無意味な return を禁止",
  "no-restricted-globals": "指定 global の使用を禁止",
  "@typescript-eslint/no-namespace": "TypeScript namespace 構文を禁止",
  "@typescript-eslint/no-explicit-any": "any 型の明示使用を禁止",
  "@typescript-eslint/no-unused-vars": "未使用変数を禁止",
  "@typescript-eslint/consistent-type-imports": "type import を強制",
  "@typescript-eslint/no-import-type-side-effects": "type import の副作用を禁止",
  "@typescript-eslint/no-unnecessary-condition": "不要な条件式を禁止",
  "@typescript-eslint/no-floating-promises": "浮いた Promise (await 漏れ) を禁止",
  "@typescript-eslint/no-misused-promises": "誤った文脈での Promise 利用を禁止",
  "@typescript-eslint/await-thenable": "await の対象が thenable であることを強制",
  "@typescript-eslint/require-await": "async 関数に await を必須化",
  "@typescript-eslint/no-unsafe-argument": "any 引数の受け渡しを禁止",
  "@typescript-eslint/no-unsafe-assignment": "any からの代入を禁止",
  "@typescript-eslint/no-unsafe-call": "any 値の関数呼び出しを禁止",
  "@typescript-eslint/no-unsafe-member-access": "any 値へのメンバアクセスを禁止",
  "@typescript-eslint/no-unsafe-return": "any 値の return を禁止",
  "@stylistic/quotes": "引用符スタイルを統一",
  "simple-import-sort/imports": "import 文の整列を強制",
  "simple-import-sort/exports": "export 文の整列を強制",
  "jsdoc/require-jsdoc": "JSDoc の付与を強制",
  "jsdoc/require-description": "JSDoc に description を必須化",
  "better-tailwindcss/no-restricted-classes": "禁止 Tailwind class を制限",
  "better-tailwindcss/enforce-consistent-class-order": "Tailwind class 順を統一",
  "better-tailwindcss/enforce-consistent-important-position": "`!important` の位置を統一",
  "better-tailwindcss/no-conflicting-classes": "競合する Tailwind class を禁止",
  "better-tailwindcss/no-deprecated-classes": "非推奨 Tailwind class を禁止",
  "better-tailwindcss/no-duplicate-classes": "重複した Tailwind class を禁止",
  "better-tailwindcss/no-unnecessary-whitespace": "不要な空白を禁止",
};

function walkSource(dir, accumulator = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkSource(path.join(dir, entry.name), accumulator);
    } else if (entry.isFile()) {
      if (!entry.name.endsWith(".mjs")) continue;
      if (SKIP_BASENAMES.has(entry.name)) continue;
      accumulator.push(path.join(dir, entry.name));
    }
  }
  return accumulator;
}

function tryInvoke(fn) {
  const attempts = [
    () => fn(SAMPLE_CONTEXT),
    () => fn(SAMPLE_CONTEXT.featureRoot),
    () => fn(["src/features/**/*.ts"]),
    () => fn(["src/features/**/*.ts"], []),
    () => fn({ featureRoot: SAMPLE_CONTEXT.featureRoot }),
    () => fn(),
  ];
  for (const attempt of attempts) {
    try {
      const result = attempt();
      if (Array.isArray(result)) return result;
    } catch {
      // try next variant
    }
  }
  return null;
}

async function buildLocationTable() {
  const map = new Map();
  const files = walkSource(path.join(PROJECT_ROOT, "src"));
  for (const filePath of files) {
    let module;
    try {
      module = await import(pathToFileURL(filePath).href);
    } catch {
      continue;
    }
    for (const value of Object.values(module)) {
      let configs = null;
      if (Array.isArray(value)) {
        configs = value;
      } else if (typeof value === "function") {
        configs = tryInvoke(value);
      }
      if (!Array.isArray(configs)) continue;
      const relative = path.relative(PROJECT_ROOT, filePath);
      for (const config of configs) {
        if (config?.name && !map.has(config.name)) {
          map.set(config.name, relative);
        }
      }
    }
  }
  return map;
}

async function loadEntryConfigs() {
  const result = [];
  for (const entry of ENTRIES) {
    const abs = path.join(PROJECT_ROOT, entry.path);
    const module = await import(pathToFileURL(abs).href);
    if (!Array.isArray(module.eslintConfig)) {
      throw new Error(`${entry.path} does not export eslintConfig as an array`);
    }
    result.push({
      name: entry.name,
      path: entry.path,
      configs: module.eslintConfig,
    });
  }
  return result;
}

function describeRule(name, value) {
  const options = Array.isArray(value) ? value.slice(1) : [];

  if (name === "no-restricted-syntax") {
    return options.flatMap((opt) => {
      if (typeof opt === "string") return [`- \`${opt}\``];
      if (opt?.message) return [`- ${opt.message}`];
      return [];
    });
  }

  if (name === "no-restricted-imports") {
    const opt = options[0];
    if (opt?.patterns) {
      return opt.patterns.map((p) => `- ${p.message ?? JSON.stringify(p)}`);
    }
    if (opt?.paths) {
      return opt.paths.map((p) => `- ${p.message ?? JSON.stringify(p)}`);
    }
    return [];
  }

  if (name === "check-file/filename-naming-convention") {
    const opt = options[0];
    if (opt) {
      return Object.entries(opt).map(
        ([glob, pattern]) =>
          `- ファイル名を \`${pattern}\` に強制 (適用: \`${glob}\`)`,
      );
    }
    return [];
  }

  if (name.startsWith("local/") || name.includes("-local/")) {
    return [`- \`${name}\` (local plugin)`];
  }

  const standard = STANDARD_DESCRIPTIONS[name];
  if (standard) return [`- ${standard}`];

  return [`- \`${name}\` (unhandled)`];
}

function extractEnforces(rules) {
  const out = [];
  if (!rules) return out;
  for (const [ruleName, ruleValue] of Object.entries(rules)) {
    out.push(...describeRule(ruleName, ruleValue));
  }
  return out;
}

function formatGlobs(value) {
  if (!value) return null;
  const list = Array.isArray(value) ? value : [value];
  return list.map((g) => `\`${g}\``).join(", ");
}

function formatTarget(config) {
  const parts = [];
  const files = formatGlobs(config.files);
  if (files) parts.push(`files: ${files}`);
  const ignores = formatGlobs(config.ignores);
  if (ignores) parts.push(`ignores: ${ignores}`);
  if (parts.length === 0) return "(global)";
  return parts.join(" / ");
}

function renderMarkdown(entries, locationByName) {
  const lines = [
    "# Rules Catalog",
    "",
    "> [!NOTE]",
    "> このファイルは `scripts/generate-rules-catalog.mjs` により自動生成。",
    "> 手動編集禁止。再生成は `npm run docs`。",
    "",
  ];

  for (const entry of entries) {
    lines.push(`## ${entry.name} (\`${entry.path}\`)`);
    lines.push("");
    for (const config of entry.configs) {
      if (!config?.name) continue;
      lines.push(`### ${config.name}`);
      lines.push("");
      const location =
        locationByName.get(config.name) ?? `${entry.path} (inline)`;
      lines.push(`- Location: ${location}`);
      lines.push(`- Target: ${formatTarget(config)}`);
      const enforces = extractEnforces(config.rules);
      if (enforces.length > 0) {
        lines.push("- Enforces:");
        for (const line of enforces) {
          lines.push(`  ${line}`);
        }
      } else {
        lines.push("- Enforces: (none)");
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

async function main() {
  const locationByName = await buildLocationTable();
  const entries = await loadEntryConfigs();
  const markdown = renderMarkdown(entries, locationByName);
  const outPath = path.join(PROJECT_ROOT, "docs/rules.md");
  fs.writeFileSync(outPath, markdown);
  const total = entries.reduce((n, e) => n + e.configs.length, 0);
  console.log(`Generated: ${path.relative(PROJECT_ROOT, outPath)}`);
  console.log(`  ${total} configs across ${entries.length} entries`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
