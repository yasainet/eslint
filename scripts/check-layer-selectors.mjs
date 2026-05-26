/**
 * layers/queries・layers/services の no-restricted-syntax が
 * layers/logger に上書きされていないことを検証する回帰ガード。
 *
 * flat config は同一ファイルにマッチする同一 rule key を後勝ちで完全置換するため、
 * features/**\/*.ts 全体へ no-restricted-syntax を設定する config を
 * queries/services より後ろに足すと制約が消失する (要 logger より前に配置)。
 */
import { ESLint } from "eslint";

import { eslintConfig as denoConfig } from "../src/deno/index.mjs";
import { eslintConfig as nextConfig } from "../src/next/index.mjs";
import { eslintConfig as nodeConfig } from "../src/node/index.mjs";

const QUERIES_REQUIRED = [
  "TryStatement",
  "IfStatement",
  "ForStatement",
  "ForOfStatement",
  "ForInStatement",
  "WhileStatement",
  "DoWhileStatement",
  "ThrowStatement",
];
const SERVICES_REQUIRED = ["TryStatement", "ThrowStatement"];
const LOGGER_SELECTOR = "CallExpression[callee.object.name='logger']";

const entries = [
  { name: "next", config: nextConfig, root: "src/features" },
  { name: "node", config: nodeConfig, root: "scripts/features" },
  {
    name: "deno",
    config: denoConfig,
    root: "supabase/functions/_features",
  },
];

const cwd = new URL("..", import.meta.url).pathname;
const failures = [];

async function selectorsFor(eslint, file) {
  const cfg = await eslint.calculateConfigForFile(file);
  const nrs = cfg.rules?.["no-restricted-syntax"];
  return Array.isArray(nrs) ? nrs.slice(1).map((o) => o.selector) : [];
}

function expect(label, file, actual, required) {
  const missing = required.filter((s) => !actual.includes(s));
  if (missing.length > 0) {
    failures.push(`${label} ${file}\n  missing: ${missing.join(", ")}`);
  }
}

for (const { name, config, root } of entries) {
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: config,
  });

  const queriesFile = `${root}/shared/queries/sample.ts`;
  const servicesFile = `${root}/shared/services/sample.ts`;
  const utilsFile = `${root}/shared/utils/sample.ts`;

  const queries = await selectorsFor(eslint, queriesFile);
  const services = await selectorsFor(eslint, servicesFile);
  const utils = await selectorsFor(eslint, utilsFile);

  expect(`[${name}] queries`, queriesFile, queries, [
    ...QUERIES_REQUIRED,
    LOGGER_SELECTOR,
  ]);
  expect(`[${name}] services`, servicesFile, services, [
    ...SERVICES_REQUIRED,
    LOGGER_SELECTOR,
  ]);
  expect(`[${name}] utils`, utilsFile, utils, [LOGGER_SELECTOR]);
}

if (failures.length > 0) {
  console.error("layer selector check FAILED:\n");
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log("layer selector check passed (next / node / deno).");
