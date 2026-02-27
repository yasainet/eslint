# Base

Next.js の推奨プリセットをベースに、コード品質を底上げする共通ルールを適用する。
プロジェクト全体で一貫したスタイルを保ち、よくあるミスを早期に検出するために存在する。

## ルール

### プリセット

| プリセット                          | 説明                             |
| ----------------------------------- | -------------------------------- |
| `eslint-config-next/core-web-vitals` | Next.js + React + Web Vitals 推奨 |
| `eslint-config-next/typescript`      | TypeScript 向け追加ルール         |

### 共通ルール

| ルール | レベル | 説明 |
| --- | --- | --- |
| `@typescript-eslint/no-unused-vars` | error | 未使用変数を禁止。`_` プレフィックスは許可 |
| `@typescript-eslint/consistent-type-imports` | error | `import type` を強制し、ランタイムバンドルから型を除外する |
| `@typescript-eslint/no-explicit-any` | warn | `any` の使用を警告。型安全性を維持する |
| `no-console` | warn | `console.*` の使い忘れを検出する |
| `no-irregular-whitespace` | warn | 全角スペースなど不正な空白文字を検出する |
| `simple-import-sort/imports` | warn | import 文を自動ソートする |
| `simple-import-sort/exports` | warn | export 文を自動ソートする |
| `@stylistic/quotes` | warn | ダブルクォートを強制する（エスケープ回避時は除外） |
| `react-you-might-not-need-an-effect` | — | 不要な `useEffect` を検出する |

## 対象ファイル

プロジェクト内のすべてのファイルに適用される（`ignoresConfig` で除外されたファイルを除く）。

### 除外パターン

- `.backup/**`
- `.next/**`
- `out/**`
- `build/**`
- `next-env.d.ts`

## エラー例・OK 例

### `@typescript-eslint/no-unused-vars`

```ts
// NG: 未使用変数
const result = fetchData();
//    ^^^^^^ error: 'result' is defined but never used

// OK: _ プレフィックスで明示的に無視
const _result = fetchData();
```

### `@typescript-eslint/consistent-type-imports`

```ts
// NG: 型を通常の import で取り込んでいる
import { User } from "./types";

// OK: import type を使用
import type { User } from "./types";
```

### `no-console`

```ts
// NG: console.log が残っている
console.log("debug");

// OK: logger を使用するか、console を削除
logger.info("debug");
```
