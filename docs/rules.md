# Rules Catalog

> [!NOTE]
> このファイルは `scripts/generate-rules-catalog.mjs` により自動生成。
> 手動編集禁止。再生成は `npm run docs`。
> 自前ルールは ESLint の実 message を転記。外部ルールは公式ドキュメントへリンク。

> [!NOTE]
> ルールは原則 (P1〜P9) ごとに整理。人間はまず原則サマリを読む。
> 同一ルールが複数 entry で共通の場合は 1 度だけ掲載し scope で示す。
> 丸めの基準: 対象と意図の両方が既存原則の延長なら丸める。両方独立なら新設。

## 原則サマリ

| # | 原則 | ルール数 |
| --- | --- | --- |
| P1 | import 規律 | 17 |
| P2 | boundary は entries 経由 | 6 |
| P3 | ファイル名規則 | 19 |
| P4 | 命名・型規約 | 4 |
| P5 | entry / directive 構造 | 7 |
| P6 | layer 内 syntax / 型制約 | 7 |
| P7 | 環境 / ファイル種別制約 | 4 |
| P8 | 汎用 TS / style / UI | 5 |
| P9 | test 粒度 | 1 |
| OTHER | その他 (非ルール) | 1 |

## P1 import 規律

依存は entries → services → queries → lib の単方向。cardinality (context 整合) と import 表記 (relative/alias, namespace/named) も含む。

### deno/lib-boundary (deno)

- Target: files: `supabase/functions/**/*.ts` / ignores: `supabase/functions/_lib/**`, `supabase/functions/_features/**/queries/**`, `supabase/functions/_features/**/types/**`
- Messages:
  - _lib/ は queries からのみ import 可。他層は queries 経由で使う。

### deno/utils-boundary (deno)

- Target: files: `supabase/functions/_utils/**/*.ts`
- Messages:
  - _utils/ は _features/ を import 不可。依存方向を守る。
  - _utils/ は _lib/ を import 不可。依存方向を守る。

### imports/entries (全 entry)

- Target: files: `src/features/**/entries/*.ts`
- Messages:
  - entries は queries を import 不可。queries は service 経由で使う。
  - entries は hooks を import 不可。依存は単方向に保つ。
  - 他 feature の entries は import 不可。feature を跨ぐ依存は禁止。
  - 他 feature の services は import 不可:
    - 同一 feature の service を 1:1 で使うか、orchestration を service 層へ移す
    - `shared/services/*` は横断的な副作用 (通知等) のため例外
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/entries/admin (全 entry)

- Target: files: `src/features/**/entries/admin.ts`
- Messages:
  - entries は queries を import 不可。queries は service 経由で使う。
  - entries は hooks を import 不可。依存は単方向に保つ。
  - 他 feature の entries は import 不可。feature を跨ぐ依存は禁止。
  - 他 feature の services は import 不可:
    - 同一 feature の service を 1:1 で使うか、orchestration を service 層へ移す
    - `shared/services/*` は横断的な副作用 (通知等) のため例外
  - admin entry は admin service のみ import 可。context を跨ぐ呼び出しは禁止。
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/entries/client (全 entry)

- Target: files: `src/features/**/entries/client.ts`
- Messages:
  - entries は queries を import 不可。queries は service 経由で使う。
  - entries は hooks を import 不可。依存は単方向に保つ。
  - 他 feature の entries は import 不可。feature を跨ぐ依存は禁止。
  - 他 feature の services は import 不可:
    - 同一 feature の service を 1:1 で使うか、orchestration を service 層へ移す
    - `shared/services/*` は横断的な副作用 (通知等) のため例外
  - client entry は client service のみ import 可。context を跨ぐ呼び出しは禁止。
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/entries/server (全 entry)

- Target: files: `src/features/**/entries/server.ts`
- Messages:
  - entries は queries を import 不可。queries は service 経由で使う。
  - entries は hooks を import 不可。依存は単方向に保つ。
  - 他 feature の entries は import 不可。feature を跨ぐ依存は禁止。
  - 他 feature の services は import 不可:
    - 同一 feature の service を 1:1 で使うか、orchestration を service 層へ移す
    - `shared/services/*` は横断的な副作用 (通知等) のため例外
  - server entry は server service のみ import 可。context を跨ぐ呼び出しは禁止。
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/feature-other (全 entry)

- Target: files: `src/features/**/*.ts` / ignores: `src/features/**/services/*.ts`, `src/features/**/queries/*.ts`, `src/features/**/entries/*.ts`, `src/features/**/utils/*.ts`, `src/features/**/types/*.ts`
- Messages:
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/feature-types (全 entry)

- Target: files: `src/features/**/types/*.ts`
- Messages:
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/lib-boundary (next)

- Target: files: `src/**/*.{ts,tsx}` / ignores: `src/lib/**`, `src/proxy.ts`, `src/app/**/route.ts`, `src/features/**`
- Messages:
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/path-style (next)

- Target: files: `src/features/**/*.ts`
- Messages:
  - 同一 feature の import は相対パスにする ('{{ importPath }}' を使わない)。
  - feature を跨ぐ import は '@/' にする (相対パス '{{ importPath }}' を使わない)。

### imports/queries (全 entry)

- Target: files: `src/features/**/queries/*.ts`
- Messages:
  - queries は services を import 不可。ロジックは services へ。
  - queries は entries を import 不可。依存は単方向に保つ。
  - queries は hooks を import 不可。依存は単方向に保つ。
  - 他 feature の queries は import 不可。feature を跨ぐ依存は禁止。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/services (全 entry)

- Target: files: `src/features/**/services/*.ts`
- Messages:
  - services は entries を import 不可。依存は単方向に保つ。
  - services は hooks を import 不可。依存は単方向に保つ。
  - 他 feature の services は import 不可。feature を跨ぐ依存は禁止。
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。

### imports/top-level-lib (全 entry)

- Target: files: `src/lib/**/*.ts`
- Messages:
  - lib は app 内部 (@/features 等) を import 不可。lib は最下層の API 橋渡し。外部 SDK と @/lib/** のみ依存可。

### imports/top-level-lib-utils (全 entry)

- Target: files: `src/lib/**/utils.ts`
- Messages:
  - lib は app 内部 (@/features 等) を import 不可。lib は最下層の API 橋渡し。外部 SDK と @/lib/** のみ依存可。
  - lib/**/utils.ts は純粋ヘルパー。client/index は import 不可、@/lib/**/types のみ可。

### imports/utils (全 entry)

- Target: files: `src/features/**/utils/*.ts`
- Messages:
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### naming/namespace-import-name (全 entry)

- Target: files: `src/features/**/*.ts`
- Messages:
  - namespace import は '{{ expected }}' と命名する ('{{ actual }}' ではなく)。

### naming/queries-namespace-import (全 entry)

- Target: files: `src/features/**/*.ts`
- Messages:
  - queries 層は named import でなく `import * as xxxQuery from "{{ source }}"` を使う (`import type {}` は可)。

## P2 boundary は entries 経由

外界 surface (page / route / hooks / sitemap / components, deno top-level) は entries のみ import 可。

### deno/entry-point (deno)

- Target: files: `supabase/functions/**/*.ts` / ignores: `supabase/functions/_*/**`
- Messages:
  - top-level file は services を直接 import 不可。entries 経由で使う。
  - top-level file は queries を直接 import 不可。entries 経由で使う。
  - top-level file は _lib/ を直接 import 不可。entries 経由で使う。

### imports/components-boundary (next)

- Target: files: `src/components/**/*.{ts,tsx}`
- Messages:
  - components は queries を直接 import 不可。entries か hooks 経由で使う。
  - components は services を直接 import 不可。entries か hooks 経由で使う。
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/hooks-boundary (next)

- Target: files: `src/features/**/hooks/*.ts`
- Messages:
  - hooks は queries を直接 import 不可。entries 経由で使う。
  - hooks は services を直接 import 不可。entries 経由で使う。
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/page-boundary (next)

- Target: files: `src/app/**/page.tsx`
- Messages:
  - page.tsx は queries を直接 import 不可。entries 経由で使う。
  - page.tsx は services を直接 import 不可。entries 経由で使う。
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/route-boundary (next)

- Target: files: `src/app/**/route.ts`
- Messages:
  - route.ts は queries を直接 import 不可。entries 経由で使う。
  - route.ts は services を直接 import 不可。entries 経由で使う。
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

### imports/sitemap-boundary (next)

- Target: files: `src/app/sitemap.ts`, `src/app/**/sitemap.ts`
- Messages:
  - sitemap.ts は queries を直接 import 不可。entries 経由で使う。
  - sitemap.ts は services を直接 import 不可。entries 経由で使う。
  - lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。
  - mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。

## P3 ファイル名規則

layer ごとに prefix / case を強制する。

### naming/components-pascal-case (next)

- Target: files: `src/components/**/*.tsx` / ignores: `src/components/shared/ui/**`, `src/components/**/index.tsx`
- Messages:
  - ファイル名を `PASCAL_CASE` に強制 (適用: `**/*.tsx`)

### naming/constants (全 entry)

- Target: files: `src/features/*/constants/*.ts` / ignores: `src/features/shared/constants/*.ts`
- Messages:
  - ファイル名を `<1>` に強制 (適用: `**/*/constants/*.ts`)

### naming/constants-shared (全 entry)

- Target: files: `src/features/shared/constants/*.ts`
- Messages:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/entries (全 entry)

- Target: files: `src/features/**/entries/*.ts` / ignores: `src/features/shared/entries/*.ts`, `**/*.test.ts`
- Messages:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/entries-shared (全 entry)

- Target: files: `src/features/shared/entries/*.ts` / ignores: `**/*.test.ts`
- Messages:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/feature-name (全 entry)

- Target: files: `src/features/**/*.ts`
- Messages:
  - feature directory '{{ name }}' は許可されない。許可: {{ allowed }}。

### naming/hooks (next)

- Target: files: `src/features/**/hooks/*.ts`
- Messages:
  - ファイル名を `use-+([a-z0-9])*(-+([a-z0-9]))` に強制 (適用: `**/*.ts`)

### naming/queries (全 entry)

- Target: files: `src/features/**/queries/*.ts` / ignores: `src/features/shared/queries/*.ts`, `**/*.test.ts`
- Messages:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/queries-shared (全 entry)

- Target: files: `src/features/shared/queries/*.ts` / ignores: `**/*.test.ts`
- Messages:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/schemas (全 entry)

- Target: files: `src/features/*/schemas/*.ts` / ignores: `src/features/shared/schemas/*.ts`, `**/*.test.ts`
- Messages:
  - ファイル名を `<1>` に強制 (適用: `**/*/schemas/*.ts`)

### naming/schemas-shared (全 entry)

- Target: files: `src/features/shared/schemas/*.ts` / ignores: `**/*.test.ts`
- Messages:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/services (全 entry)

- Target: files: `src/features/**/services/*.ts` / ignores: `src/features/shared/services/*.ts`, `**/*.test.ts`
- Messages:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/services-shared (全 entry)

- Target: files: `src/features/shared/services/*.ts` / ignores: `**/*.test.ts`
- Messages:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/top-level-lib (全 entry)

- Target: files: `src/lib/**/*.ts`
- Messages:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/top-level-utils (全 entry)

- Target: files: `src/utils/**/*.ts`
- Messages:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/types (全 entry)

- Target: files: `src/features/*/types/*.ts` / ignores: `src/features/shared/types/*.ts`
- Messages:
  - ファイル名を `<1>` に強制 (適用: `**/*/types/*.ts`)

### naming/types-shared (全 entry)

- Target: files: `src/features/shared/types/*.ts`
- Messages:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/utils (全 entry)

- Target: files: `src/features/*/utils/*.ts` / ignores: `src/features/shared/utils/*.ts`, `**/*.test.ts`
- Messages:
  - ファイル名を `<1>` に強制 (適用: `**/*/utils/*.ts`)

### naming/utils-shared (全 entry)

- Target: files: `src/features/shared/utils/*.ts` / ignores: `**/*.test.ts`
- Messages:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

## P4 命名・型規約

layer ごとの export 名と FormState 型の命名・shape を強制する。

### naming/form-state (全 entry)

- Target: files: `src/features/**/*.ts`
- Messages:
  - FormState 型 '{{ name }}' は {Verb}{Subject}FormState 形式にする (例 CreateCommentFormState, SignInFormState)。PascalCase 2 語以上が必須。
  - FormState '{{ name }}' に `data` プロパティが必須 (payload が無ければ `data: null`)。
  - FormState '{{ name }}' の `data` は null 許容にする (例: `data: T | null` / `data: null`)。
  - FormState '{{ name }}' に `error: { message: string } | null` プロパティが必須。
  - FormState '{{ name }}' の `error` は nullable にする (`{ message: string } | null`)。
  - FormState '{{ name }}' の `error` は厳密に `{ message: string } | null`。
  - FormState '{{ name }}' の `error` は `message: string` のみ許可。禁止フィールド: '{{ field }}'。
  - FormState '{{ name }}' は `data` と `error` のみ。禁止プロパティ: '{{ field }}'。
  - FormState '{{ name }}' は単一の interface か type literal にする。discriminated union 不可。

### naming/hooks-export (next)

- Target: files: `src/features/**/hooks/*.ts`
- Messages:
  - hooks の export 関数は 'use' で始める (例: useAuth)。

### naming/queries-export (全 entry)

- Target: files: `src/features/**/queries/*.ts`
- Messages:
  - queries の export '{{ name }}' は get, create, update, delete, signUp, signIn, signOut のいずれかで始める。

### naming/schema-naming (全 entry)

- Target: files: `src/features/**/schemas/*.ts` / ignores: `**/*.test.ts`
- Messages:
  - schema file の export 変数 '{{ name }}' は 'Schema' で終える。
  - export 変数 '{{ name }}' は camelCase にする (小文字始まり)。

## P5 entry / directive 構造

entry の try/catch + log 構造と use server / client directive を強制する。

### directives/admin-entry (next)

- Target: files: `src/features/**/entries/admin.ts`
- Messages:
  - entries/admin.ts は先頭に "use server" directive が必須。

### directives/client-entry (next)

- Target: files: `src/features/**/entries/client.ts`
- Messages:
  - entries/client.ts は "use server" 禁止。@/lib/supabase/client を使うため。

### directives/hooks (next)

- Target: files: `src/features/**/hooks/*.ts`
- Messages:
  - hooks は先頭に "use client" directive が必須。

### directives/server-entry (next)

- Target: files: `src/features/**/entries/server.ts`
- Messages:
  - entries/server.ts は先頭に "use server" directive が必須。

### entry-points/no-namespace-import (全 entry)

- Target: files: `src/app/**/*.ts`, `src/app/**/*.tsx`
- Messages:
  - entry point は `import * as` 禁止。named import で依存を明示する。

### naming/entry-single-service-call (全 entry)

- Target: files: `src/features/**/entries/*.ts`
- Messages:
  - entry '{{ funcName }}' が複数の feature service を呼んでいる ({{ count }} 件):
    - entry は単一 service を呼ぶ薄いラッパー、orchestration は service 層へ移す
    - `shared/services/*` (例 `sharedDiscordService`) は例外

### naming/entry-template (全 entry)

- Target: files: `src/features/**/entries/*.ts`
- Messages:
  - entry '{{ funcName }}' の body は次のいずれか:
    - 単一の try/catch (Pattern A)
    - try/catch + 末尾の navigation 呼び出し `redirect(...)` / `notFound(...)` (Pattern B)
  - entry '{{ funcName }}' の try block が空。
  - entry '{{ funcName }}' の try block は `logger.info(<obj>, "Start {{ funcName }}")` で始める。
  - entry '{{ funcName }}' の success return の直前に `logger.info(<obj>, "Success {{ funcName }}")` が必須。
  - entry '{{ funcName }}' は success return `return { data, error: null }` が必須。
  - entry '{{ funcName }}' の Failed 分岐は return 前に `logger.error(<obj>, "Failed {{ funcName }}")` を呼ぶ。
  - entry '{{ funcName }}' の catch param は `error: unknown`。
  - entry '{{ funcName }}' の catch block が空。
  - entry '{{ funcName }}' の catch block は `logger.error(<obj>, "Unexpected error in {{ funcName }}")` で始める。
  - entry '{{ funcName }}' の catch block は return 文で終える。
  - entry '{{ funcName }}' の catch return の error.message はリテラル '{{ expected }}'。実際: '{{ actual }}'。
  - '{{ funcName }}' の {{ where }} log は `logger.{{ expectedLevel }}(<obj>, "{{ expectedMessage }}")`。
  - {{ where }} log message は '{{ expectedMessage }}'。実際: '{{ actual }}'。
  - '{{ funcName }}' の {{ where }} log の第 1 引数は object literal にする。
  - '{{ funcName }}' の {{ where }} log object は `err:` キーで始める。
  - '{{ funcName }}' の {{ where }} log に入力引数 '{{ argName }}' が無い。全ての関数入力を log object に伝播する。

## P6 layer 内 syntax / 型制約

layer ごとに禁止構文 (try / throw / loop / logger 等) と Supabase 型安全を強制する。

### layers/entries (全 entry)

- Target: files: `src/features/**/entries/*.ts`
- Messages:
  - features layers で `@/` パスの動的 import は禁止 (prefix-lib / lateral 制約を迂回する):
    - 内部依存は queries/<prefix>.ts か services/<prefix>.ts を作る
    - 外部 npm は cold-start 最適化の遅延 import なら可

### layers/logger (全 entry)

- Target: files: `src/features/**/*.ts` / ignores: `src/features/**/entries/*.ts`
- Messages:
  - [`no-console`](https://eslint.org/docs/latest/rules/no-console)
  - logger は entries 以外で禁止。ログ出力は entries に集約する。

### layers/no-any-return (next, node)

- Target: files: `src/features/**/queries/*.ts`, `src/features/**/services/*.ts`
- Messages:
  - export 関数の推論された返り値型に `any` が含まれる: {{ typeText }}。既知の型を注釈するか絞り込む (public な層の API は型を確定させる)。

### layers/queries (全 entry)

- Target: files: `src/features/**/queries/*.ts`
- Messages:
  - queries では try-catch 禁止。エラーは `{ data, error }` で返す。
  - queries で if 文は禁止。条件分岐は services に置く。
  - queries でループは禁止。queries は薄い CRUD ラッパー、反復は services に置く。
  - queries でループは禁止。queries は薄い CRUD ラッパー、反復は services に置く。
  - queries でループは禁止。queries は薄い CRUD ラッパー、反復は services に置く。
  - queries でループは禁止。queries は薄い CRUD ラッパー、反復は services に置く。
  - queries でループは禁止。queries は薄い CRUD ラッパー、反復は services に置く。
  - queries で throw は禁止。Supabase の `{ data, error }` をそのまま返す。
  - logger は entries 以外で禁止。ログ出力は entries に集約する。
  - features layers で `@/` パスの動的 import は禁止 (prefix-lib / lateral 制約を迂回する):
    - 内部依存は queries/<prefix>.ts か services/<prefix>.ts を作る
    - 外部 npm は cold-start 最適化の遅延 import なら可

### layers/services (全 entry)

- Target: files: `src/features/**/services/*.ts`
- Messages:
  - services で try-catch は禁止。エラー処理は entries に集約する。
  - services で throw は禁止。失敗は値で返す:
    - `T | null` / `{ data, error }` / 空デフォルトのいずれか
    - lib の native 例外は entry の catch に自動伝播する
  - logger は entries 以外で禁止。ログ出力は entries に集約する。
  - error message の dead fallback。この分岐に来た時点で error は既知 — error をそのまま返す。
  - nullable error の dead fallback。`if (error)` で判定し error をそのまま返す。
  - features layers で `@/` パスの動的 import は禁止 (prefix-lib / lateral 制約を迂回する):
    - 内部依存は queries/<prefix>.ts か services/<prefix>.ts を作る
    - 外部 npm は cold-start 最適化の遅延 import なら可

### naming/supabase-columns-satisfies (全 entry)

- Target: files: `src/features/**/queries/*.ts`, `src/features/**/constants/*.ts`
- Messages:
  - column 定数 `{{ name }}` は `"<comma-separated columns>" as const` にする。`as const` を外すと Supabase の `.select()` 型推論が壊れる。配列 / template literal も不可。

### naming/supabase-select (全 entry)

- Target: files: `src/features/**/queries/*.ts`
- Messages:
  - 空の `.select()` は全列を暗黙取得する。文字列リテラルか `*_COLUMNS` 定数を渡す。
  - `.select("*")` はスキーマ拡張時に列を暗黙露出する。列を明示列挙する。
  - `.select()` の template literal は型推論を壊す。文字列リテラルか `*_COLUMNS` 定数を使う。
  - `.select()` の引数は文字列リテラルか `*_COLUMNS` 識別子にする。
  - column 定数 `{{ name }}` は `_COLUMNS` で終わる UPPER_SNAKE_CASE にする (例 POST_DETAIL_COLUMNS)。

## P7 環境 / ファイル種別制約

実行環境と拡張子 (.ts / .tsx) の制約。

### deno/flat-entry-point (deno)

- Target: files: `supabase/functions/**/*.ts` / ignores: `supabase/functions/_*/**`
- Messages:
  - Edge Function の entry point は supabase/functions/ 直下に置く。ネストした directory (例 commands/{{name}}) は Supabase CLI 非対応。

### imports/ban-alias (node, deno)

- Target: files: `scripts/features/**/*.ts`
- Messages:
  - この環境では alias import (@/) は使えない。相対パスを使う。

### naming/components-tsx-only (next)

- Target: files: `src/components/**/*.ts`
- Messages:
  - components/ は .tsx のみ。ロジックは src/features/ に置く。

### naming/features-ts-only (全 entry)

- Target: files: `src/features/**/*.tsx`
- Messages:
  - features/ は .ts のみ。component は src/components/ に置く。

## P8 汎用 TS / style / UI

全ファイル共通の TypeScript / 整形 / Tailwind / layout 規律。

### jsdoc (全 entry)

- Target: files: `src/features/**/queries/*.ts`, `src/features/**/services*/*.ts`, `src/features/**/utils*/*.ts`
- Messages:
  - [`jsdoc/require-jsdoc`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-jsdoc.md)
  - [`jsdoc/require-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-description.md)

### layouts/main-structural-only (next)

- Target: files: `src/app/**/layout.tsx`
- Messages:
  - layout.tsx の <main> は構造のみ。spacing/装飾 ({{ tokens }}) は page.tsx へ移す (例 <Container className="py-8">)。

### rules/shared (全 entry)

- Target: (global)
- Messages:
  - [`no-console`](https://eslint.org/docs/latest/rules/no-console)
  - [`no-irregular-whitespace`](https://eslint.org/docs/latest/rules/no-irregular-whitespace)
  - [`no-unreachable`](https://eslint.org/docs/latest/rules/no-unreachable)
  - [`no-constant-condition`](https://eslint.org/docs/latest/rules/no-constant-condition)
  - [`no-constant-binary-expression`](https://eslint.org/docs/latest/rules/no-constant-binary-expression)
  - [`no-dupe-else-if`](https://eslint.org/docs/latest/rules/no-dupe-else-if)
  - [`no-self-assign`](https://eslint.org/docs/latest/rules/no-self-assign)
  - [`no-useless-catch`](https://eslint.org/docs/latest/rules/no-useless-catch)
  - [`no-fallthrough`](https://eslint.org/docs/latest/rules/no-fallthrough)
  - [`no-unreachable-loop`](https://eslint.org/docs/latest/rules/no-unreachable-loop)
  - [`no-useless-return`](https://eslint.org/docs/latest/rules/no-useless-return)
  - [`no-self-compare`](https://eslint.org/docs/latest/rules/no-self-compare)
  - [`simple-import-sort/imports`](https://github.com/lydell/eslint-plugin-simple-import-sort)
  - [`simple-import-sort/exports`](https://github.com/lydell/eslint-plugin-simple-import-sort)
  - [`@stylistic/quotes`](https://eslint.style/rules/quotes)

### rules/typescript (全 entry)

- Target: files: `**/*.ts`, `**/*.tsx`
- Messages:
  - [`@typescript-eslint/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars)
  - [`@typescript-eslint/consistent-type-imports`](https://typescript-eslint.io/rules/consistent-type-imports)
  - [`@typescript-eslint/no-explicit-any`](https://typescript-eslint.io/rules/no-explicit-any)
  - [`@typescript-eslint/no-unnecessary-condition`](https://typescript-eslint.io/rules/no-unnecessary-condition)
  - [`@typescript-eslint/no-floating-promises`](https://typescript-eslint.io/rules/no-floating-promises)
  - [`@typescript-eslint/no-misused-promises`](https://typescript-eslint.io/rules/no-misused-promises)
  - [`@typescript-eslint/await-thenable`](https://typescript-eslint.io/rules/await-thenable)
  - [`@typescript-eslint/require-await`](https://typescript-eslint.io/rules/require-await)
  - [`@typescript-eslint/no-unsafe-assignment`](https://typescript-eslint.io/rules/no-unsafe-assignment)
  - [`@typescript-eslint/no-unsafe-call`](https://typescript-eslint.io/rules/no-unsafe-call)
  - [`@typescript-eslint/no-unsafe-member-access`](https://typescript-eslint.io/rules/no-unsafe-member-access)
  - [`@typescript-eslint/no-unsafe-argument`](https://typescript-eslint.io/rules/no-unsafe-argument)
  - [`@typescript-eslint/no-unsafe-return`](https://typescript-eslint.io/rules/no-unsafe-return)

### tailwindcss/rules (next)

- Target: files: `src/**/*.{ts,tsx}`
- Messages:
  - [`better-tailwindcss/enforce-consistent-class-order`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-class-order.md)
  - [`better-tailwindcss/enforce-consistent-important-position`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-important-position.md)
  - [`better-tailwindcss/no-conflicting-classes`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-conflicting-classes.md)
  - [`better-tailwindcss/no-deprecated-classes`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-deprecated-classes.md)
  - [`better-tailwindcss/no-duplicate-classes`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-duplicate-classes.md)
  - margin を避け、padding/gap で間隔を制御する (例外: mx-auto, -mt-*)
  - space-x/space-y は避ける (内部で margin を使う)。flex/grid + gap を使う
  - [`better-tailwindcss/no-unnecessary-whitespace`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-unnecessary-whitespace.md)

## P9 test 粒度

test の配置粒度を強制する。orchestration (services/queries/entries) は co-located test 禁止 (mock の echo になるため e2e に委ねる)。pure layer の unit presence は test-audit CLI が別途担保。

### test/no-colocated-test (全 entry)

- Target: files: `src/features/**/services/**/*.test.{ts,tsx}`, `src/features/**/queries/**/*.test.{ts,tsx}`, `src/features/**/entries/**/*.test.{ts,tsx}`
- Messages:
  - orchestration layer (services/queries/entries) に test を置かない。mock の echo になる:
    - 配線の検証は e2e に委ねる
    - 純粋ロジックは utils へ抽出し、そちらを unit する

## OTHER その他 (非ルール)

lint ルールではない除外設定など。原則に割り当てられないルールもここに集約される。

### rules/ignore-shadcn-ui (next)

- Target: ignores: `src/components/shared/ui/*.{ts,tsx}`
- Messages: (none)
