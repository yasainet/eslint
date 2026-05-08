# CLAUDE.md

Shared ESLint flat config that enforces feature-based architecture.

## Project Overview

`@yasainet/eslint` provides three entry points: `@yasainet/eslint/next`, `@yasainet/eslint/node`, `@yasainet/eslint/deno`

### 思想的背景

このプロジェクトは **ESLint を Claude Code の羅針盤とする** という思想で設計されている。

- 人間はファジーに指示する（厳密に指示できるならコードを書いた方が早い）
- Claude Code はファジーな指示から既存コードベースを参照して実装する
- しかし人間が意図しないアーキテクチャを採用することも日常茶飯事
- ESLint で規約を機械的に enforce することで、Claude は error message から再帰的に自己修正する
- **ファジー入力 × 決定論的検証 = 再現性のあるアウトプット**（production ML システムの定石）

## Tech Stack

- ESLint 9 flat config (ESM only, `.mjs`)
- No build step, no test framework — verify by running `npm install` in a consuming project
- Code comments and JSDoc descriptions in English

## Environment Architecture

- **Local development**: `npm install` in a consuming Next.js or Node.js project to verify config behavior
- **CI/CD**: GitHub Actions triggers on `v*` tags to publish to npm
- **npm**: Published as `@yasainet/eslint`, consumed via `npm install @yasainet/eslint`

## Directory Structure

```text
src/
├── common/   # Shared rules for all environments
├── next/     # Next.js-specific rules (hooks, components, directives)
├── node/     # Node.js CLI scripts (scripts/features, scripts/commands)
└── deno/     # Deno entry point (entry-point boundary, _utils boundary, _lib boundary)
```

## 命名規約 (Phase 6: interactors → entries / 2026-05-06)

> [!IMPORTANT]
> 全 layer で role suffix (`*.lib` / `*.service` / `*.query` / `*.util` / `*.type` / `*.schema` / `*.constant` / `*.entry`) を **廃止** した。役割は **ディレクトリ名のみ** で宣言する。
> **Phase 6 (2026-05-06)**: `interactors/` を `entries/` にリネーム。「外界 (page.tsx / route.ts / hooks) から呼ばれる入口」という責務を直接表す命名に統一。

### lib/ の命名

`lib/<dir>/` 配下のファイル名は単一トークン (`*` パターン、ドット禁止)。lib の構造は **`index.ts` の有無**で 2 種類に分岐する:

| 種別              | 検出条件                  | プレフィックス登録               | 例                                                        |
| ----------------- | ------------------------- | -------------------------------- | --------------------------------------------------------- |
| **single-client** | `lib/<dir>/index.ts` あり | `<dir>` のみ (sub-module は除外) | `lib/gallery-dl/{index.ts, parser.ts, types.ts}`          |
| **multi-client**  | `index.ts` 不在           | dir 内の全 `<role>.ts`           | `lib/supabase/{admin.ts, server.ts, client.ts, proxy.ts}` |

- `types.ts` (複数形) / `type.ts` (単数形) / `proxy.ts` は EXCLUDE_LIST で常に prefix 登録から除外。型ファイルの命名は consuming project の好みに任せる
- 多重拡張子 (`.test.ts` 等) のファイルも自動除外
- `lib/<dir>/index.ts` は redundant な `lib/<dir>/<dir>.ts` を回避し、import が `from "@/lib/<dir>"` に短縮される
- single-client lib では sub-module (e.g., `parser.ts`) は **構造的に queries 層から見えない** (prefix 衝突を起こさない)

### features/ の命名

| layer        | ファイル名                             | 補足                                                                                             |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `queries/`   | `<lib-prefix>.ts`                      | 1 file = 1 lib への呼び出し集約。lib-boundary lint で他 lib 禁止                                 |
| `services/`  | `<lib-prefix>.ts`                      | サービスは複数 lib を組み合わせる orchestration                                                  |
| `entries/`   | `server.ts` / `admin.ts` / `client.ts` | server/admin は `"use server"` 強制、client は禁止。page.tsx / route.ts / hooks から呼ばれる入口 |
| `types/`     | `<feature>.ts`                         | feature と同名 1 ファイル                                                                        |
| `schemas/`   | `<feature>.ts`                         | 同上                                                                                             |
| `utils/`     | `<feature>.ts`                         | 同上                                                                                             |
| `constants/` | `<feature>.ts`                         | 同上                                                                                             |
| `hooks/`     | `use-<verb>.ts`                        | React 慣例の `use-` prefix を許容                                                                |

### shared/ の意味

`features/shared/` は cross-feature な共通モジュール置き場。ファイル名は `@(shared|<lib-prefix>)` を許可する:

- `shared/services/shared.ts` — どの lib にも紐つかない汎用 service
- `shared/services/supabase.ts` — supabase を呼ぶ shared service

### prefixLibMapping の生成ロジック

`src/common/constants.mjs` の `generatePrefixLibMapping` が ESLint 起動時に `lib/` をスキャンし、上記ルールで prefix → lib path のマッピングを生成する。新しい lib を追加すると **自動的に** queries / services / entries の許可ファイル名が拡張される。

## Commands

```bash
npm install   # Install dependencies (no build or test commands)
```

## Verification

```bash
node -e "import('./src/next/index.mjs').then(m => console.log('next:', Object.keys(m)))"
node -e "import('./src/node/index.mjs').then(m => console.log('node:', Object.keys(m)))"
```

## Testing in Consuming Projects

`npm link` is not suitable — symlinks cause duplicate plugin errors (e.g., "Cannot redefine plugin @typescript-eslint"). Use `npm pack` instead:

```bash
# Pack the local package, then install the tarball in the consuming project
cd ~/Projects/eslint && npm pack --pack-destination /tmp
cd ~/Projects/<project> && npm install /tmp/yasainet-eslint-*.tgz

# After testing, revert to the registry version
npm install @yasainet/eslint@latest
```
