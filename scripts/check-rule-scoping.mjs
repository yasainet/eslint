/**
 * next/node の TypeScript 系 rule (no-console 等) が、entry root 外の
 * ファイルに適用されていないことを検証する回帰ガード。
 *
 * createCommonConfigs(featureRoot, { rulesFiles }) の rulesFiles を渡し忘れると、
 * createTypescriptConfigs() の files がデフォルト ["**\/*.ts", "**\/*.tsx"] のままになり、
 * リポジトリ全体の .ts/.tsx が対象になってしまう
 * (例: next 単体利用時に scripts/*.ts にも no-console が適用される)。
 */
import { ESLint } from "eslint";

import denoConfig from "../src/deno/index.mjs";
import nextConfig from "../src/next/index.mjs";
import nodeConfig from "../src/node/index.mjs";

const entries = [
  {
    name: "next",
    config: nextConfig,
    inScope: "src/features/shared/utils/sample.ts",
    outOfScope: "scripts/faceswap.ts",
  },
  {
    name: "node",
    config: nodeConfig,
    inScope: "scripts/features/shared/utils/sample.ts",
    outOfScope: "src/app/page.tsx",
  },
  {
    name: "deno",
    config: denoConfig,
    inScope: "supabase/functions/_features/shared/utils/sample.ts",
    outOfScope: "src/app/page.tsx",
  },
];

const cwd = new URL("..", import.meta.url).pathname;
const failures = [];

async function noConsoleRuleFor(eslint, file) {
  const cfg = await eslint.calculateConfigForFile(file);
  return cfg?.rules?.["no-console"];
}

for (const { name, config, inScope, outOfScope } of entries) {
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: config,
  });

  const inScopeRule = await noConsoleRuleFor(eslint, inScope);
  const outOfScopeRule = await noConsoleRuleFor(eslint, outOfScope);

  if (inScopeRule === undefined) {
    failures.push(
      `[${name}] ${inScope}\n  expected no-console to be configured, got: undefined`,
    );
  }
  if (outOfScopeRule !== undefined) {
    failures.push(
      `[${name}] ${outOfScope}\n  expected no-console to be unconfigured (outside rulesFiles scope), got: ${JSON.stringify(outOfScopeRule)}`,
    );
  }
}

if (failures.length > 0) {
  console.error("rule scoping check FAILED:\n");
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log("rule scoping check passed (next / node / deno).");
