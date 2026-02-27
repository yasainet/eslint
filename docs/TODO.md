# TODO: @yasainet/eslint-next → @yasainet/eslint への統合

## Background

bitcomic.net (Next.js) プロジェクトの `scripts/*` ディレクトリに対する ESLint 適用を検討した結果、以下の課題が浮上した。

### Problem

- Next.js プロジェクトの `scripts/*` は純粋な Node.js コード（React/Next.js API を一切使わない）
- `scripts/features/*` は `src/features/*` と同じ 3 層アーキテクチャ（actions → services → repositories）を持つ
- 現状 `@yasainet/eslint-next` のルールがそのまま適用されるが、React/Next.js 固有ルール（directives, hooks 等）は不要
- Node.js プロジェクト向けに `@yasainet/eslint-node` を別パッケージとして作ると、汎用ルール更新時に複数パッケージの publish が必要になる
- さらに Supabase Edge Functions (Deno) 向けのルールも将来必要になる可能性がある

### Analysis

`@yasainet/eslint-next` のルールを分類した結果：

| Category             | Modules                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| General (~70%)       | imports, layers (repos/services/actions 部分), naming (services/repos/actions/types/schemas 部分), jsdoc, base (TypeScript/stylistic 部分) |
| Next.js/React (~30%) | directives (全体), layers (hooks 部分), naming (hooks/components 部分), base (react-you-might-not-need-an-effect)                          |

---

## Decision

### Single package with multiple exports

`@yasainet/eslint-next` を `@yasainet/eslint` にリネームし、単一パッケージで複数環境をサポートする。

```jsonc
// package.json
{
  "name": "@yasainet/eslint",
  "exports": {
    "./next": "./src/next/index.mjs",
    "./node": "./src/node/index.mjs",
    // Future: "./deno": "./src/deno/index.mjs"
  },
}
```

### Directory structure

```
src/
├── common/    # General rules (TypeScript, imports, layers, naming, jsdoc...)
├── next/      # common + React/Next.js specific rules
├── node/      # common + Node.js specific rules
└── deno/      # common + Deno specific rules (future)
```

### Consumer usage

```js
// Next.js project
import { eslintConfig } from "@yasainet/eslint/next";

// Node.js project
import { eslintConfig } from "@yasainet/eslint/node";

// Next.js project with scripts/ (mixed)
import { eslintConfig as nextConfig } from "@yasainet/eslint/next";
import { eslintConfig as nodeConfig } from "@yasainet/eslint/node";

export default defineConfig([
  ...nextConfig, // src/** → Next.js rules
  ...nodeConfig, // scripts/** → Node.js rules
]);
```

### Benefits

- Single publish で全環境に汎用ルール更新が反映される
- `src/common/` を直接 import するだけで共有でき、バージョン不整合が起きない
- 将来 Deno (Supabase Edge Functions) が必要になっても `src/deno/` を追加するだけ

---

## Tasks

- [ ] `src/common/` に汎用ルールを抽出
- [ ] `src/next/` に React/Next.js 固有ルールを分離
- [ ] `src/node/` に Node.js 固有ルールを作成
- [ ] package.json の `name` を `@yasainet/eslint` に変更し `exports` を設定
- [ ] 既存の消費側プロジェクトの import パスを更新
- [ ] npm publish

---

> [!IMPORTANT]
> `tmp` ディレクトリで `npx create-next-app@latest .` を実行した。理由は、Next.js が提供するデフォルトの eslint の設定も理解してほしいからだ。
> つまり、`/Users/yasainet/Projects/yasainet/eslint-next/tmp/eslint.config.mjs` を尊重しつつ、`@yasainet/eslint` が追加されるのが better だと思っている。理由は公式が提供する設定を保ちつつ、独自のルールも適用できるからだ。これにより、Next.js の公式ルールと独自ルールの両方を活用できる。
