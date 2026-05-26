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

const PRINCIPLES = [
  {
    id: "P1",
    title: "import 規律",
    desc: "依存は entries → services → queries → lib の単方向。cardinality (context 整合) と import 表記 (relative/alias, namespace/named) も含む。",
  },
  {
    id: "P2",
    title: "boundary は entries 経由",
    desc: "外界 surface (page / route / hooks / sitemap / components, deno top-level) は entries のみ import 可。",
  },
  {
    id: "P3",
    title: "ファイル名規則",
    desc: "layer ごとに prefix / case を強制する。",
  },
  {
    id: "P4",
    title: "命名・型規約",
    desc: "layer ごとの export 名と FormState 型の命名・shape を強制する。",
  },
  {
    id: "P5",
    title: "entry / directive 構造",
    desc: "entry の try/catch + log 構造と use server / client directive を強制する。",
  },
  {
    id: "P6",
    title: "layer 内 syntax / 型制約",
    desc: "layer ごとに禁止構文 (try / throw / loop / logger 等) と Supabase 型安全を強制する。",
  },
  {
    id: "P7",
    title: "環境 / ファイル種別制約",
    desc: "実行環境と拡張子 (.ts / .tsx) の制約。",
  },
  {
    id: "P8",
    title: "汎用 TS / style / UI",
    desc: "全ファイル共通の TypeScript / 整形 / Tailwind / layout 規律。",
  },
  {
    id: "P9",
    title: "test 粒度",
    desc: "test の配置粒度を強制する。orchestration (services/queries/entries) は co-located test 禁止 (mock の echo になるため e2e に委ねる)。pure layer の unit presence は test-audit CLI が別途担保。",
  },
  {
    id: "OTHER",
    title: "その他 (非ルール)",
    desc: "lint ルールではない除外設定など。原則に割り当てられないルールもここに集約される。",
  },
];

const RULE_PRINCIPLE = {
  "imports/queries": "P1",
  "imports/services": "P1",
  "imports/entries": "P1",
  "imports/entries/server": "P1",
  "imports/entries/client": "P1",
  "imports/entries/admin": "P1",
  "imports/lib-boundary": "P1",
  "imports/top-level-lib": "P1",
  "imports/top-level-lib-utils": "P1",
  "imports/utils": "P1",
  "imports/feature-other": "P1",
  "imports/feature-types": "P1",
  "imports/path-style": "P1",
  "naming/queries-namespace-import": "P1",
  "naming/namespace-import-name": "P1",
  "deno/lib-boundary": "P1",
  "deno/utils-boundary": "P1",
  "imports/page-boundary": "P2",
  "imports/route-boundary": "P2",
  "imports/hooks-boundary": "P2",
  "imports/sitemap-boundary": "P2",
  "imports/components-boundary": "P2",
  "deno/entry-point": "P2",
  "naming/queries": "P3",
  "naming/queries-shared": "P3",
  "naming/services": "P3",
  "naming/services-shared": "P3",
  "naming/entries": "P3",
  "naming/entries-shared": "P3",
  "naming/constants": "P3",
  "naming/constants-shared": "P3",
  "naming/schemas": "P3",
  "naming/schemas-shared": "P3",
  "naming/types": "P3",
  "naming/types-shared": "P3",
  "naming/utils": "P3",
  "naming/utils-shared": "P3",
  "naming/top-level-utils": "P3",
  "naming/top-level-lib": "P3",
  "naming/hooks": "P3",
  "naming/components-pascal-case": "P3",
  "naming/feature-name": "P3",
  "naming/queries-export": "P4",
  "naming/hooks-export": "P4",
  "naming/schema-naming": "P4",
  "naming/form-state": "P4",
  "naming/entry-template": "P5",
  "naming/entry-single-service-call": "P5",
  "directives/server-entry": "P5",
  "directives/admin-entry": "P5",
  "directives/client-entry": "P5",
  "directives/hooks": "P5",
  "entry-points/no-namespace-import": "P5",
  "layers/queries": "P6",
  "layers/services": "P6",
  "layers/entries": "P6",
  "layers/logger": "P6",
  "layers/no-any-return": "P6",
  "naming/supabase-columns-satisfies": "P6",
  "naming/supabase-select": "P6",
  "imports/ban-alias": "P7",
  "naming/features-ts-only": "P7",
  "naming/components-tsx-only": "P7",
  "deno/flat-entry-point": "P7",
  "rules/shared": "P8",
  "rules/typescript": "P8",
  jsdoc: "P8",
  "tailwindcss/rules": "P8",
  "layouts/main-structural-only": "P8",
  "test/no-colocated-test": "P9",
  "rules/ignore-shadcn-ui": "OTHER",
};

const LOCAL_PLUGIN_PREFIXES = ["local", "deno-local"];

function externalRuleDocUrl(name) {
  if (name.startsWith("@typescript-eslint/")) {
    return `https://typescript-eslint.io/rules/${name.slice("@typescript-eslint/".length)}`;
  }
  if (name.startsWith("@stylistic/")) {
    return `https://eslint.style/rules/${name.slice("@stylistic/".length)}`;
  }
  if (name.startsWith("simple-import-sort/")) {
    return "https://github.com/lydell/eslint-plugin-simple-import-sort";
  }
  if (name.startsWith("jsdoc/")) {
    return `https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/${name.slice("jsdoc/".length)}.md`;
  }
  if (name.startsWith("better-tailwindcss/")) {
    return `https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/${name.slice("better-tailwindcss/".length)}.md`;
  }
  return `https://eslint.org/docs/latest/rules/${name}`;
}

function localPluginMessages(name, config) {
  const slash = name.indexOf("/");
  const pluginKey = name.slice(0, slash);
  const ruleName = name.slice(slash + 1);
  const messages =
    config?.plugins?.[pluginKey]?.rules?.[ruleName]?.meta?.messages;
  if (!messages) return null;
  return Object.values(messages);
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

function describeRule(name, value, config) {
  const options = Array.isArray(value) ? value.slice(1) : [];

  if (name === "no-restricted-syntax") {
    return options.flatMap((opt) => {
      if (typeof opt === "string") return [`\`${opt}\``];
      if (opt?.message) return [opt.message];
      return [];
    });
  }

  if (name === "no-restricted-imports") {
    const opt = options[0];
    const list = opt?.patterns ?? opt?.paths ?? [];
    return list.map((p) => p.message ?? JSON.stringify(p));
  }

  if (name === "better-tailwindcss/no-restricted-classes") {
    const opt = options[0];
    return (opt?.restrict ?? []).map((r) => r.message ?? JSON.stringify(r));
  }

  if (name === "check-file/filename-naming-convention") {
    const opt = options[0];
    if (opt) {
      return Object.entries(opt).map(
        ([glob, pattern]) =>
          `ファイル名を \`${pattern}\` に強制 (適用: \`${glob}\`)`,
      );
    }
    return [];
  }

  const pluginKey = name.includes("/") ? name.slice(0, name.indexOf("/")) : "";
  if (LOCAL_PLUGIN_PREFIXES.includes(pluginKey)) {
    const messages = localPluginMessages(name, config);
    if (messages) return messages;
    return [`\`${name}\` (local plugin)`];
  }

  return [`[\`${name}\`](${externalRuleDocUrl(name)})`];
}

function collectMessages(rules, config) {
  const out = [];
  if (!rules) return out;
  for (const [ruleName, ruleValue] of Object.entries(rules)) {
    out.push(...describeRule(ruleName, ruleValue, config));
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

function aggregateRules(entries) {
  const map = new Map();
  for (const entry of entries) {
    for (const config of entry.configs) {
      if (!config?.name) continue;
      let info = map.get(config.name);
      if (!info) {
        info = { name: config.name, config, entries: new Set() };
        map.set(config.name, info);
      }
      info.entries.add(entry.name);
    }
  }
  return map;
}

function scopeLabel(entrySet) {
  const all = ENTRIES.map((e) => e.name);
  if (all.every((name) => entrySet.has(name))) return "全 entry";
  return all.filter((name) => entrySet.has(name)).join(", ");
}

function renderRule(info) {
  const lines = [`### ${info.name} (${scopeLabel(info.entries)})`, ""];
  lines.push(`- Target: ${formatTarget(info.config)}`);
  const messages = collectMessages(info.config.rules, info.config);
  if (messages.length > 0) {
    lines.push("- Messages:");
    for (const message of messages) {
      const parts = message.split("\n");
      lines.push(`  - ${parts[0]}`);
      for (let i = 1; i < parts.length; i++) {
        lines.push(`    ${parts[i]}`);
      }
    }
  } else {
    lines.push("- Messages: (none)");
  }
  lines.push("");
  return lines;
}

function renderMarkdown(aggregated) {
  const byPrinciple = new Map(PRINCIPLES.map((p) => [p.id, []]));
  const unmapped = [];
  for (const info of aggregated.values()) {
    const pid = RULE_PRINCIPLE[info.name];
    if (pid && byPrinciple.has(pid)) {
      byPrinciple.get(pid).push(info);
    } else {
      unmapped.push(info.name);
      byPrinciple.get("OTHER").push(info);
    }
  }
  for (const list of byPrinciple.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const lines = [
    "# Rules Catalog",
    "",
    "> [!NOTE]",
    "> このファイルは `scripts/generate-rules-catalog.mjs` により自動生成。",
    "> 手動編集禁止。再生成は `npm run docs`。",
    "> 自前ルールは ESLint の実 message を転記。外部ルールは公式ドキュメントへリンク。",
    "",
    "> [!NOTE]",
    "> ルールは原則 (P1〜P9) ごとに整理。人間はまず原則サマリを読む。",
    "> 同一ルールが複数 entry で共通の場合は 1 度だけ掲載し scope で示す。",
    "> 丸めの基準: 対象と意図の両方が既存原則の延長なら丸める。両方独立なら新設。",
    "",
    "## 原則サマリ",
    "",
    "| # | 原則 | ルール数 |",
    "| --- | --- | --- |",
  ];
  for (const p of PRINCIPLES) {
    lines.push(`| ${p.id} | ${p.title} | ${byPrinciple.get(p.id).length} |`);
  }
  lines.push("");

  for (const p of PRINCIPLES) {
    const list = byPrinciple.get(p.id);
    if (list.length === 0) continue;
    lines.push(`## ${p.id} ${p.title}`);
    lines.push("");
    lines.push(p.desc);
    lines.push("");
    for (const info of list) {
      lines.push(...renderRule(info));
    }
  }

  return { markdown: lines.join("\n"), unmapped };
}

async function main() {
  const entries = await loadEntryConfigs();
  const aggregated = aggregateRules(entries);
  const { markdown, unmapped } = renderMarkdown(aggregated);
  const outPath = path.join(PROJECT_ROOT, "docs/rules.md");
  fs.writeFileSync(outPath, markdown);
  console.log(`Generated: ${path.relative(PROJECT_ROOT, outPath)}`);
  console.log(
    `  ${aggregated.size} unique rules across ${entries.length} entries`,
  );
  if (unmapped.length > 0) {
    console.warn(
      `  WARNING: ${unmapped.length} rule(s) not mapped to a principle (placed in OTHER):`,
    );
    for (const name of unmapped) console.warn(`    - ${name}`);
    console.warn("  → RULE_PRINCIPLE に原則を割り当ててください。");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
