/**
 * next/node/deno の TypeScript 系 rule (no-console 等) が、entry root 外の
 * ファイルに適用されていないことを検証する回帰ガード。
 *
 * createCommonConfigs(featureRoot, { rulesFiles }) の rulesFiles を渡し忘れると、
 * createTypescriptConfigs() の files がデフォルト ["**\/*.ts", "**\/*.tsx"] のままになり、
 * リポジトリ全体の .ts/.tsx が対象になってしまう
 * (例: next 単体利用時に scripts/*.ts にも no-console が適用される)。
 *
 * rules/shared (no-console 等) 自体は files を持つが、consumer は実際には
 * @yasainet/eslint を eslint-config-next 等の他 preset と同じ flat config 配列に
 * 合成して使う (docs/setup.md 参照)。他 preset 側が repo 全体にマッチする
 * files (例: eslint-config-next/typescript の "**\/*.ts" 相当) を持つ config object を
 * 持ち込むと、rules/shared に files が無ければそちら側の scope に相乗りして
 * 漏れが再現する。FOREIGN_BROAD_TS_CONFIG はその状況を模した synthetic object。
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

// eslint-config-next/typescript の typescript-eslint/eslint-recommended 相当
// (repo 全体の .ts/.tsx にマッチする、consumer が持ち込む foreign preset の模擬)。
const FOREIGN_BROAD_TS_CONFIG = {
  name: "foreign/broad-ts",
  files: ["**/*.ts", "**/*.tsx"],
  rules: {},
};

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

  // consumer が foreign preset (eslint-config-next 等) と合成しても、
  // rules/shared が foreign 側の広域 files に相乗りしないことを確認する。
  const combinedEslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: [FOREIGN_BROAD_TS_CONFIG, ...config],
  });
  const combinedOutOfScopeRule = await noConsoleRuleFor(
    combinedEslint,
    outOfScope,
  );
  if (combinedOutOfScopeRule !== undefined) {
    failures.push(
      `[${name}+foreign] ${outOfScope}\n  expected no-console to be unconfigured even when combined with a foreign broad-ts config, got: ${JSON.stringify(combinedOutOfScopeRule)}`,
    );
  }
}

if (failures.length > 0) {
  console.error("rule scoping check FAILED:\n");
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log("rule scoping check passed (next / node / deno).");
