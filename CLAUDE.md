# CLAUDE.md

Shared ESLint flat config used across @yasainet's Next.js / Supabase projects.

## Why You Are Reading This

- このファイルは consuming project の Claude Code が実装前に読む想定で書かれている
- consuming project = `@yasainet/eslint` を install している Next.js / Supabase / Node.js / Deno プロジェクト
- ここに書かれた規約に従わないと ESLint が error を返す → error message を自己修正の手がかりに使え
- このリポジトリ自体を修正する Claude は `## When Modifying This Package` セクションを参照せよ

## Philosophy

このプロジェクトは ESLint を Claude Code の羅針盤とするという思想で設計されている。

- 人間はファジーに指示する (厳密に指示できるならコードを書いた方が早い)
- Claude Code はファジーな指示から既存コードベースを参照して実装する
- しかし人間が意図しないアーキテクチャを採用することも日常茶飯事
- ESLint で規約を機械的に enforce することで、Claude は error message から再帰的に自己修正する
- ファジー入力 × 決定論的検証 = 再現性のあるアウトプット (production ML システムの定石)

## Architecture Rules

consuming project で実装するときに守るべき規約。ESLint が enforce するので、これを破ると lint error になる。

### Directory Structure

```text
{featureRoot}/
├── {feature}/
│   ├── entries/        # 外界 (page.tsx / route.ts / hooks) から呼ばれる入口
│   ├── services/       # 複数 lib を組み合わせる orchestration
│   ├── queries/        # data access (1 file = 1 lib)
│   ├── types/          # 型定義
│   ├── schemas/        # zod schemas
│   ├── utils/          # pure helpers
│   ├── constants/      # 定数
│   └── hooks/          # use-<verb>.ts
└── shared/             # cross-feature 共通モジュール
{libRoot}/
├── {single-client-lib}/index.ts
└── {multi-client-lib}/<role>.ts
```

featureRoot の位置は entry point によって異なる:

| Entry                   | featureRoot                    |
| ----------------------- | ------------------------------ |
| `@yasainet/eslint/next` | `src/features/`                |
| `@yasainet/eslint/node` | `scripts/features/`            |
| `@yasainet/eslint/deno` | `supabase/functions/features/` |

### lib/ の命名

`lib/<dir>/` 配下のファイル名は単一トークン (`*` パターン、ドット禁止)。
lib の構造は `index.ts` の有無で 2 種類に分岐する:

| 種別          | 検出条件                  | プレフィックス登録               | 例                                                        |
| ------------- | ------------------------- | -------------------------------- | --------------------------------------------------------- |
| single-client | `lib/<dir>/index.ts` あり | `<dir>` のみ (sub-module は除外) | `lib/gallery-dl/{index.ts, parser.ts, types.ts}`          |
| multi-client  | `index.ts` 不在           | dir 内の全 `<role>.ts`           | `lib/supabase/{admin.ts, server.ts, client.ts, proxy.ts}` |

- `types.ts` / `type.ts` / `proxy.ts` は EXCLUDE_LIST で常に prefix 登録から除外
  - 型ファイルの命名は consuming project の好みに任せる
- 多重拡張子 (`.test.ts` 等) のファイルも自動除外
- single-client lib の sub-module (e.g., `parser.ts`) は構造的に queries 層から見えない (prefix 衝突を起こさない)
  - Why: single-client の SDK 内部実装を feature 層に漏らさない
- `lib/<dir>/index.ts` は redundant な `lib/<dir>/<dir>.ts` を回避し、import が `from "@/lib/<dir>"` に短縮される

### features/ の命名

| layer        | ファイル名                             | 補足                                                                    |
| ------------ | -------------------------------------- | ----------------------------------------------------------------------- |
| `queries/`   | `<lib-prefix>.ts`                      | 1 file = 1 lib への呼び出し集約。lib-boundary lint で他 lib import 禁止 |
| `services/`  | `<lib-prefix>.ts`                      | 複数 lib を組み合わせる orchestration                                   |
| `entries/`   | `server.ts` / `admin.ts` / `client.ts` | server/admin は `"use server"` 強制、client は禁止                      |
| `types/`     | `<feature>.ts`                         | feature と同名 1 ファイル                                               |
| `schemas/`   | `<feature>.ts`                         | 同上                                                                    |
| `utils/`     | `<feature>.ts`                         | 同上                                                                    |
| `constants/` | `<feature>.ts`                         | 同上                                                                    |
| `hooks/`     | `use-<verb>.ts`                        | React 慣例の `use-` prefix を許容                                       |

`entries/` は外界 (page.tsx / route.ts / hooks) から呼ばれる入口という責務を直接表す命名。

### shared/ の意味

`features/shared/` は cross-feature な共通モジュール置き場。ファイル名は `@(shared|<lib-prefix>)` を許可する:

- `shared/services/shared.ts` — どの lib にも紐つかない汎用 service
- `shared/services/supabase.ts` — supabase を呼ぶ shared service

### prefixLibMapping の自動生成

`src/common/constants.mjs` の `generatePrefixLibMapping` が ESLint 起動時に `lib/` をスキャンし、
上記ルールで prefix → lib path のマッピングを自動生成する。
新しい lib を追加すると自動的に queries / services / entries の許可ファイル名が拡張される。

### Tailwind CSS (next entry only)

- `m-*` (margin) 系クラスは禁止。spacing は親要素の padding / gap で制御せよ
  - 例外: `mx-auto` / `m*-auto` / 負の margin (`-mt-*`) / variant-prefixed (`first:mt-0`)
  - Why: margin は親要素の layout を侵食し、子コンポーネントを portable でなくする
- 以下も enforce される:
  - `enforce-consistent-class-order`
  - `enforce-consistent-important-position`
  - `no-conflicting-classes`
  - `no-deprecated-classes`
  - `no-duplicate-classes`
  - `no-unnecessary-whitespace`

## When Modifying This Package

このリポジトリ (`@yasainet/eslint`) 自体を修正するときの注意。consuming project の Claude は読まなくて良い。

- ESLint 9 flat config / ESM only (`.mjs`) / no build step / no test framework
- Code comments / JSDoc は英語
- Tailwind CSS の `entryPoint` は consuming project の `src/app/globals.css` を絶対パスで auto-resolve する
  - Why: plugin の relative-path 解決は `cwd`-based
  - LSP server (vscode-eslint, Zed) では cwd が編集中ファイルの directory になり破綻する
- 検証は consuming project で `npm pack` して動作確認する
  - `npm link` は禁止 (symlink が duplicate plugin error を引き起こす)

## Commands

依存インストール (no build / no test):

```bash
npm install
```

Release (patch): `/bump` skill が patch version の git tag を作成して push する。CI が npm publish する。

Release (minor / major): 手動で tag を作成 & push する。

```bash
git tag vX.Y.0
git push --tags
```

## Verification

Module exports の sanity check (このリポジトリ内で):

```bash
node -e "import('./src/next/index.mjs').then(m => console.log('next:', Object.keys(m)))"
node -e "import('./src/node/index.mjs').then(m => console.log('node:', Object.keys(m)))"
```

consuming project での動作確認 → publish の流れ。
Claude は consuming project から呼び出されているケースが多いため、`cd` を明示すること。

1. このリポジトリで local pack を生成:

   ```bash
   cd ~/Projects/eslint && npm pack --pack-destination /tmp
   ```

2. consuming project で tarball を install:

   ```bash
   cd ~/Projects/<project> && npm install /tmp/yasainet-eslint-*.tgz
   ```

3. consuming project で実装に対する lint 動作を確認する (期待通り error / pass するか)

4. 問題なければ release。`cd ~/Projects/eslint` してから `/bump` を実行する (patch bump)。
   - minor / major の場合は `Commands` セクションを参照。

5. consuming project を registry の最新版に update:

   ```bash
   cd ~/Projects/<project> && npm install @yasainet/eslint@latest
   ```
