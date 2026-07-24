# Scope `next` / `node` TypeScript Rules to Their Entry Root Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## TL;DR

- Bug: `@yasainet/eslint/next` を単体で使っても、`no-console` 等の TypeScript 系 rule がリポジトリ全体 (`scripts/` 等 `src/` 外を含む) の `.ts`/`.tsx` に適用されてしまう。`node` entry も同じ構造の bug を持つ。
- 原因: `src/common/base/typescript.mjs` の `createTypescriptConfigs({ typeAware, files })` は `files` (デフォルト `["**/*.ts", "**/*.tsx"]`) を持つ `rules/typescript` config object を生成する。ESLint flat config では、ある `.ts`/`.tsx` ファイルが「そもそも lint 対象として認識されるか」は、**この `files` パターンにマッチするかどうかで決まる** (`no-console` 等を持つ `files` 無しの `rules/shared` は、他の object が対象と認めたファイルにだけ相乗りする — `rules/shared` 自体を修正する必要はない、実験で確認済み)。`src/next/index.mjs` と `src/node/index.mjs` は `createCommonConfigs(featureRoot, { rulesFiles })` を呼ぶ際に `rulesFiles` を渡していないため、`files` がデフォルトのままリポジトリ全体を対象にしてしまう。`src/deno/index.mjs` は既に `rulesFiles: ["supabase/functions/**/*.ts"]` を渡しており、**現時点で scoping は正しく機能している** (実験で確認済み、deno は修正不要)。
- 修正: `src/next/index.mjs` と `src/node/index.mjs` の `createCommonConfigs()` 呼び出しに、それぞれ自分の root 配下を指す `rulesFiles` を追加するだけ。`src/common/base/typescript.mjs` は変更しない。
- 検証: 既存の `npm run check` (`scripts/check-layer-selectors.mjs`) と同じ「`ESLint#calculateConfigForFile` を仮想パスに対して呼ぶ」流儀で新規 `scripts/check-rule-scoping.mjs` を追加し、regression として固定する (このリポジトリに test framework は無いため)。呼び出す対象ファイルが完全に scope 外だと `calculateConfigForFile` は `undefined` を返す (`isPathIgnored` が true になる) ので、判定は `cfg?.rules?.["no-console"]` のように optional chaining で行う。
- 影響範囲: `src/next/index.mjs` / `src/node/index.mjs` / `scripts/check-rule-scoping.mjs` (新規) / `package.json` の `check` script / root `CLAUDE.md` の Commands 節。`src/common/base/typescript.mjs` と `src/deno/index.mjs` はコード変更なし。

**Goal:** `@yasainet/eslint` の `next` / `node` の各 entry が、自身の担当ルート配下のファイルにのみ TypeScript 系 rule (`no-console` 等の shared rule、type-aware rule) を適用するようにし、他領域 (例: `next` 利用時の `scripts/`) への rule 漏れを止める。

**Architecture:** `src/common/index.mjs` の `createCommonConfigs(featureRoot, { rulesFiles })` は既に `rulesFiles` を `createTypescriptConfigs({ files })` に正しく配線している。`src/next/index.mjs` / `src/node/index.mjs` から自分の root glob を明示的に渡すだけで、根本原因ごと解消する。

**Tech Stack:** ESLint 9 flat config (`.mjs`, ESM) / Node.js 組み込み `ESLint` クラスによる素の regression script (test framework 不使用、本リポジトリの既存規約に準拠)。

## Global Constraints

- ESLint 9 flat config / ESM only (`.mjs`) / no build step / no test framework (root `CLAUDE.md`)
- 検証は consuming project で `npm pack` して動作確認する (`npm link` 禁止) — 今回のリポジトリ内 verification には該当しないが、release 後の最終確認手順として踏襲する
- commit message は `<type>(<scope>): <日本語 summary>` 形式 (例: `fix(next): ...`)
- `docs/setup.md` の使用例 (呼び出し側は `rulesFiles` を渡さず単純 spread する) は変更不要 — 各 entry が自分の `rulesFiles` を内部で持つのが今回のゴールそのもの
- `src/common/base/typescript.mjs` と `src/deno/index.mjs` は変更しない (deno は既に正しく scoping されていることを実験で確認済み)

---

### Task 1: `next` / `node` entry に `rulesFiles` を渡して scope leak を止める

**Files:**
- Modify: `src/next/index.mjs:22` (`createCommonConfigs("src/features")` 呼び出しに `rulesFiles` を追加)
- Modify: `src/node/index.mjs:9` (`createCommonConfigs("scripts/features", { banAliasImports: true })` 呼び出しに `rulesFiles` を追加)
- Create: `scripts/check-rule-scoping.mjs` (regression script、`scripts/check-layer-selectors.mjs` と同じ流儀)
- Modify: `package.json` (`scripts.check` を2スクリプト実行に変更)
- Modify: `CLAUDE.md` (root, Commands 節の `npm run check` 説明を更新)

**Interfaces:**
- Consumes: `createCommonConfigs(featureRoot, { banAliasImports, typeAware, rulesFiles })` (既存, `src/common/index.mjs`) — シグネチャ変更なし、呼び出し側の引数を増やすだけ
- Produces: `src/next/index.mjs` / `src/node/index.mjs` の default export (`yasainetConfig`) の実際の適用範囲が変わる (`no-console` 等が entry root 外のファイルに適用されなくなる) — この変更を利用する他タスクは無い

- [ ] **Step 1: 現状の漏れを再現する regression script を書く**

`scripts/check-layer-selectors.mjs` と同じ手法 (`ESLint` + `calculateConfigForFile` + 仮想パス + `expect`/`failures` 蓄積) で `scripts/check-rule-scoping.mjs` を新規作成する。

対象外ファイルが完全に scope 外だと `calculateConfigForFile` は `undefined` を返す (例: 現状の `deno` config に `src/app/page.tsx` を渡すと `isPathIgnored` が `true` になり `undefined` が返る) ため、`cfg?.rules?.[...]` と optional chaining で受ける。

```js
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
```

- [ ] **Step 2: package.json に配線して、まず FAIL することを確認する**

`package.json` の `scripts.check` を変更:

```json
"scripts": {
  "check": "node scripts/check-layer-selectors.mjs && node scripts/check-rule-scoping.mjs"
},
```

Run: `npm run check`

Expected: `check-layer-selectors.mjs` は PASS するが、`check-rule-scoping.mjs` が `next` と `node` の `outOfScope` で FAIL する (`deno` は既に正しく scoping されているため PASS する):

```
rule scoping check FAILED:

[next] scripts/faceswap.ts
  expected no-console to be unconfigured (outside rulesFiles scope), got: [1,{}]

[node] src/app/page.tsx
  expected no-console to be unconfigured (outside rulesFiles scope), got: [1,{}]
```

これが再現できたら Step 3 に進む。

- [ ] **Step 3: `src/next/index.mjs` に `rulesFiles` を渡す**

変更前 (`src/next/index.mjs`):

```js
const yasainetConfig = [
  {
    name: "rules/ignore-shadcn-ui",
    ignores: ["src/components/shared/ui/*.{ts,tsx}"],
  },
  ...createCommonConfigs("src/features"),
  ...libBoundaryConfigs,
```

変更後:

```js
const yasainetConfig = [
  {
    name: "rules/ignore-shadcn-ui",
    ignores: ["src/components/shared/ui/*.{ts,tsx}"],
  },
  ...createCommonConfigs("src/features", {
    rulesFiles: ["src/**/*.ts", "src/**/*.tsx"],
  }),
  ...libBoundaryConfigs,
```

- [ ] **Step 4: `src/node/index.mjs` に `rulesFiles` を渡す**

変更前 (`src/node/index.mjs`):

```js
const yasainetConfig = [
  ...createCommonConfigs("scripts/features", { banAliasImports: true }),
  ...nodeEntryPointConfigs,
];
```

変更後:

```js
const yasainetConfig = [
  ...createCommonConfigs("scripts/features", {
    banAliasImports: true,
    rulesFiles: ["scripts/**/*.ts"],
  }),
  ...nodeEntryPointConfigs,
];
```

- [ ] **Step 5: `npm run check` を実行し、全 PASS を確認する**

Run: `npm run check`

Expected:

```
layer selector check passed (next / node / deno).
rule scoping check passed (next / node / deno).
```

- [ ] **Step 6: root `CLAUDE.md` の Commands 節を更新する**

変更前:

```
- Layer selector 回帰チェック: `npm run check` (queries/services の no-restricted-syntax が logger に上書きされていないか検証 / publish CI でも実行)
```

変更後:

```
- 回帰チェック: `npm run check` (queries/services の no-restricted-syntax が logger に上書きされていないか、next/node/deno の TypeScript 系 rule が entry root 外に漏れていないかを検証 / publish CI でも実行)
```

- [ ] **Step 7: module export の sanity check を実行する**

root `CLAUDE.md` の Verification 節に既にあるコマンドで、3 entry が例外なく import できることを確認する:

```bash
node -e "import('./src/next/index.mjs').then(m => console.log('next:', Object.keys(m)))"
node -e "import('./src/node/index.mjs').then(m => console.log('node:', Object.keys(m)))"
node -e "import('./src/deno/index.mjs').then(m => console.log('deno:', Object.keys(m)))"
```

Expected: 3 コマンドとも `default: [ 'default' ]` 相当の出力でエラーなく終了する。

- [ ] **Step 8: commit**

```bash
git add src/next/index.mjs src/node/index.mjs scripts/check-rule-scoping.mjs package.json CLAUDE.md
git commit -m "$(cat <<'EOF'
fix(next): next/node entry の TypeScript rule を entry root に scoping する

next/node を単体利用しても no-console 等が entry root 外 (例: next 利用時の
scripts/) に漏れないよう、createCommonConfigs に rulesFiles を渡すようにした。
deno は既に rulesFiles を渡しており対象外。
EOF
)"
```

## Follow-up (この plan のスコープ外)

- この修正は `@yasainet/eslint` パッケージ内で完結する。修正を反映した新バージョンを consuming project (例: `swaptok.net`) で使うには、release 後 (`/bump` skill か `git tag` → CI publish) に該当 project 側で `@yasainet/eslint` を bump する別作業が必要。
