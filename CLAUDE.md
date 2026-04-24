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

Rails の思想（「規約は多少冗長でも迷わない方が勝つ」「利用しないファイルですら規約として置く」）は AI エージェント時代に再評価されるべき。表現力と自由度は Next.js/TypeScript/shadcn/ui 側で確保し、**規律だけ Rails から輸入する**のが本パッケージの目指す方向。

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

## TODO

### 既存の TODO

- `src/common/rules.mjs` の `@typescript-eslint/no-unnecessary-condition` を `warn` から `error` に昇格する。全 consuming project で warning が 0 になってから。

### 3 層命名刷新（段階実装 - 2026-04-25 更新）

> [!NOTE]
> 3 フェーズで段階的に実装する。Phase 1 は決定、Phase 2 は協議中、Phase 3 は未着手。

#### 背景

- 前提思想: 人間はコードを読まない（JSDoc のみ）。LLM が生成する。ゆえにボイラープレートはノーコスト
- 現状の命名は歴史的経緯（web app は server-first だった → "actions" = Server Actions）。責務と名前の整合が取れていない
- 名前は LLM への指示である。コードの**位置（どの層にあるか）が意図を表す最大の装置**になるので、名前は「響き」ではなく「LLM が誤解せず、lint が縛りきれるか」で決める
- Rails から借りるのは **community pattern (thin)** であり **core 用語 (fat)** ではない。Rails core (Model, Controller) は fat で yasainet の thin layer と合わない

#### Phase 1: ディレクトリ名・ファイル名 + `handle*` prefix 撤廃 ✅ 実装済 (2026-04-25)

| 旧              | 新                | 変更    | 根拠                                                         |
| --------------- | ----------------- | ------- | ------------------------------------------------------------ |
| `repositories/` | `queries/`        | ✅ 変更 | Rails Query Object と対応。DDD の Repository 概念を避ける    |
| `*.repo.ts`     | `*.query.ts`      | ✅ 変更 | ディレクトリ名と一致                                         |
| `services/`     | `services/`       | 維持    | Rails Service Object と一致。TS で `models` は schema 連想   |
| `*.service.ts`  | `*.service.ts`    | 維持    | 同上                                                         |
| `actions/`      | `interactors/`    | ✅ 変更 | Rails Interactor と責務完全一致。`handlers/` は Route 衝突   |
| `*.action.ts`   | `*.interactor.ts` | ✅ 変更 | ディレクトリ名と一致                                         |
| `handle*` prefix | (撤廃)           | ✅ 変更 | namespace import で disambiguate 済み、prefix は情報冗長     |

**ESLint 実装変更点:**

- `src/common/local-plugins/action-handle-service.mjs` を削除（`handle*` 呼び出し検証ルール）
- `src/common/local-plugins/index.mjs` から `actionHandleServiceRule` 削除
- `src/common/local-plugins/namespace-import-name.mjs` の `LAYER_MAP`: `repo/action` → `query/interactor`
- `src/common/naming.mjs`: `repoPattern/actionPattern` → `queryPattern/interactorPattern`、`naming/actions-export` (handle\* 強制) を削除
- `src/common/layers.mjs`: `layers/repositories` → `layers/queries`、エラーメッセージ全更新
- `src/common/imports.mjs`: `LAYER_PATTERNS` / `LATERAL_PATTERNS` / `CARDINALITY_PATTERNS` のキー・メッセージ更新
- `src/common/jsdoc.mjs`: glob `repositories` → `queries`
- `src/next/directives.mjs`: `directives/server-action` → `directives/server-interactor` 等
- `src/deno/imports.mjs`: メッセージ更新
- `README.md`: ディレクトリ構造図更新

**決定の経緯メモ:**

- `repositories/` → `queries/`: 実態は Supabase の `{data, error}` pass-through。Rails scope / Query Object に対応。write 操作も SQL 的には "query" なので含める
- `services/` 維持: Rails Fat Model 連想の `models/` 案は却下。現代 TS/Prisma 世界で `models` = schema の連想が強く、`schemas/` / `types/` と並立すると「どれが Comic の model なのか」混乱を招く
- `actions/` → `interactors/`: `client.action.ts` が Server Action ではないという「嘘」状態を解消。`handlers/` + `handle*` prefix も最終候補だったが、Phase 2 で prefix 撤廃が決まったためディレクトリ名の根拠（韻）が消失。結果 `interactors/` に収束
- **Rails core 用語 (`models/`, `controllers/`) は fat の連想で命名トラップになる**ため回避。community pattern (thin) に揃える

#### Phase 2: 関数名の allow list 化（Rails 5 actions）🟡 協議中

**Phase 1 で `handle*` 強制は既に撤廃済み**。Phase 2 では Rails 5 verbs を allow list として追加する。

**方針:**

- Rails 5 actions (`index / show / create / update / destroy`) を基軸に
- auth は domain-specific verb (`signUp / signIn / signOut / current`)
- custom action は Rails member / collection pattern (`pages`, `thumbnails`, `search`)
- queries / services / interactors の 3 層で同じ関数名が並ぶことを許容（すでに queries ↔ services では実績あり）

**関数名 allow list (ドラフト):**

```js
const CORE_VERBS = /^(index|show|create|update|destroy)$/;
const INDEX_FAMILY = /^index[A-Z][a-zA-Z]*$/; // indexByCircle, indexPaginated
const AUTH_VERBS = /^(signUp|signIn|signOut|current|me)$/;
const CUSTOM_ACTIONS = /^[a-z][a-zA-Z]*$/; // search, pages, thumbnails
```

**現状から新命名へのマッピング (REDACTED の 3 feature で検証済):**

`auth/interactors/server.interactor.ts`:

- `handleSignUp` → `signUp`
- `handleSignIn` → `signIn`
- `handleSignOut` → `signOut`

`auth/interactors/client.interactor.ts`:

- `handleGetUser` → `current` (または `me`)

`users/interactors/server.interactor.ts`:

- `handleGetUserById` → `show`

`comics/interactors/server.interactor.ts`:

- `handleGetComics` → `index`
- `handleGetComicsPaginated` → `indexPaginated`
- `handleGetComicsByCircle` → `indexByCircle`
- `handleGetComicsByCirclePaginated` → `indexByCirclePaginated`
- `handleGetComicsByAuthor` → `indexByAuthor`
- `handleGetComicsByAuthorPaginated` → `indexByAuthorPaginated`
- `handleGetComicsByAuthors` → `indexByAuthors`
- `handleGetComicsByTag` → `indexByTag`
- `handleGetComicsByTagPaginated` → `indexByTagPaginated`
- `handleGetAllComics` → `indexAll`
- `handleGetComicById` → `show`
- `handleGetComicPages` → `pages` (member custom action)
- `handleGetComicThumbnails` → `thumbnails` (collection custom action)

`comics/interactors/client.interactor.ts`:

- `handleSearchComics` → `search` (collection custom action)

**協議中の論点:**

- [ ] `index` variant の表現: `indexByX` 族 vs options 集約 (`index({ by, value })`)
  - 推し: `indexByX` 族（LLM 生成の予測可能性優先、戻り値型が単純）
  - 対立: options 集約（Rails 純度最高、関数数最小、条件付き型が複雑化）
- [ ] `current` vs `me`（auth の「現在のユーザー取得」関数名）
- [ ] 動詞 allow list に `fetch`, `list`, `find` を含めるか（推し: 含めない、Rails verbs に統一）
- [ ] property 別 update (`handleUpdateShopName` 等) の扱い（既存 TODO 参照）

#### Phase 3: 外部サービス対応 🔴 未着手

**背景:**

- `queries/` (= 旧 repositories/) は Supabase への to/from を前提にしている
- しかし実際には **Resend (メール送信), Stripe (決済), Discord (通知) など「to only / from only」の外部サービス**も存在する
- 厳密には "query" とは呼びにくい（メール送信は create / send）
- ただし SQL 文脈では INSERT も "query" なので、`create` / `send` 動詞として `queries/` に含めるのは整合可能

**過去プロジェクトでの対応例（統一されていない）:**

- `pornfusion.com`: `features/shared/` に resend 関連コード
- `chuchu`: `features/shared/` + `templates` 概念
- `oyatsu`: `resend.util.ts` を utils に配置
- 現状: プロジェクト毎に揺れ。統一規約がない

**論点:**

- [ ] `queries/` に送信系 action を含めるか（例: `queries/resend.query.ts` の `send()` / `create()` 関数）
- [ ] それとも別の概念 (`commands/`, `operations/`) として分離するか
- [ ] templates の扱い（メール本文、Discord embed、Stripe invoice item 等）をどこに置くか
- [ ] 既存の prefix システム（`{prefix}.query.ts` は `lib/{prefix}` 以外 import 不可）に乗せるか。`lib/resend.lib.ts` + `queries/resend.query.ts` の構造で統一可能か
- [ ] 関数名 allow list を拡張するか（`send`, `notify`, `charge` 等を許容）

**Phase 1/2 との関係:**

- 現時点で `queries/` は Supabase 専用ではなく、既に `garage.query.ts` 等の S3 系を許容している（`generatePrefixLibMapping` で自動派生）
- したがって `resend.query.ts` / `stripe.query.ts` を追加すること自体はアーキテクチャ的に整合する
- 問題は「関数名と責務の semantic」。Phase 2 の関数名規則（index/show/create/update/destroy）が resend に馴染むか検証が必要

#### 責務の 1 行定義（Phase 1 決定版）

- **queries**: 外部データソースへの 1 回のリクエストをカプセル化する（入: プリミティブ / 出: raw response）
- **services**: ドメインモデルを構築する（入: プリミティブ / 出: domain type + error）
- **interactors**: 外部入力を受け取りドメインロジックへ委譲し、観測と例外を吸収する（入: 外部入力 / 出: UI 消費可能な形）

#### 責務マトリクス（Phase 1 決定版）

| 項目                          | queries | services | interactors       |
| ----------------------------- | ------- | -------- | ----------------- |
| try-catch                     | ❌      | ❌       | ✅                |
| if 文                         | ❌      | ✅       | ✅                |
| for/while                     | ❌      | ✅       | ✅                |
| throw                         | ❌      | ❌       | ❌                |
| logger                        | ❌      | ❌       | ✅                |
| mapSnakeToCamel               | ❌      | ✅       | ❌                |
| redirect                      | ❌      | ❌       | ✅                |
| 他 feature の同層 import      | ❌      | ❌       | ❌                |
| lib/\*.lib.ts 直接 import     | ✅      | ❌       | ❌                |
| 関数名 prefix                 | なし    | なし     | なし (Phase 2)    |
| 動詞 allow list               | ✅      | ✅       | ✅ (Phase 2)      |
| `"use server"` ディレクティブ | N/A     | N/A      | server/admin のみ |

#### 移行計画

**Phase 1 実装 (ESLint 側):**

1. `@yasainet/eslint` の全 lint ルールで名称変更:
   - `repositories` → `queries` (glob, config name, error message)
   - `actions` → `interactors`
   - `*.repo` → `*.query` (check-file naming convention pattern)
   - `*.action` → `*.interactor`
2. backward compatibility 方針（**要決定**）:
   - 案 A: 旧名称を廃止（破壊的変更、v1.0.0 でメジャーバンプ、consuming project は即時 migration）
   - 案 B: 旧名称と新名称を両方許容する移行期間を設ける（実装複雑度↑）
3. `handle*` prefix のルールは Phase 2 まで維持

**Phase 1 実装 (consuming project 側):**

1. migration script: directory rename + file rename + import path 書き換え
2. REDACTED で dogfood → 他 consuming project へ展開

**Phase 2 実装:**

- `handle*` prefix 撤廃 (`naming/actions-export` ルール削除)
- Rails 5 actions + auth verbs + custom action allow list を `naming/interactors-export` として追加
- 関数名 migration script（AST ベース rename）

**Phase 3 実装:**

- `queries/` の意味論を外部サービスに拡張、または別 layer 追加
- templates の配置規約
- lib prefix システムの resend/stripe/discord 対応

#### 補足: 3 層維持（`entities/` は導入しない）

- 4 層は過剰。Fat Service に知識を集約する
- `entities/` 導入の目安: `isPublished` / `isLikedBy` / `canEditBy` のような domain behavior が 5 個以上 service に散らばってきた時
- 小規模なうちは types に JSDoc で業務ルールを書く程度で十分

---

### 新規 TODO（Catch プロジェクトの調査から抽出）

#### 🔴 最優先: feature 骨格の統一

- [ ] **feature 配下の 8 ディレクトリ構造を強制**
  - `interactors / constants / hooks / queries / schemas / services / types / utils` の 8 ディレクトリを全 feature で必須化（Phase 1 命名刷新済）
  - 使用しない場合でも空ディレクトリ（または `.gitkeep`）を置く = Rails 的な「利用しないファイルですら規約」
  - 実装: glob で feature root を検出し、存在しないディレクトリを error として報告するカスタムルール
  - 悩み: 一部 PJ では `workflows` を利用している。どうしようかな〜という気持ち。workflows には json が配置されている

- [ ] **`queries/` と `lib/` の逆方向対応を検証**
  - すでに担保されていること:
    - `lib/*.lib.ts` を自動 scan して prefix のマスターリストを生成（`generatePrefixLibMapping`）
    - `queries/` のファイル名は allow list に従う（`createNamingConfigs` の `queryPattern`）
    - `{prefix}.query.ts` は対応する `lib/{prefix}` 以外を import 不可（`prefixLibPatterns`）
    - `server / client / admin`（認証コンテキスト軸）と `garage / stripe` 等（データソース軸）を区別する必要はなく、**全て `lib/*.lib.ts` からの 1:1 派生**として統一的に扱える
  - まだ担保されていないこと:
    - `lib/X.lib.ts` が存在するが、どの feature にも `X.query.ts` が無い（= 宣言したが使っていない）
    - `feature` 内で `server / client / admin` が必要なのに欠けている（例: auth は server + client のみ、users は 3 層、shops は server のみ、という揺れ）
  - 検討項目:
    - 「feature ごとに必要な lib prefix を宣言するマニフェスト」を置くか？
    - 「全 feature で全 prefix を揃える」は過剰なので避ける（実務的な落とし所）

#### 🟡 中優先: CRUD 命名の Rails scaffold 相当化

- [ ] **CRUD 関数名を Rails の 5 アクション（`index / show / create / update / destroy`）に対応させる**
  - List: `handleGet{Plural}` 例: `handleGetShops`
  - Show: `handleGet{Singular}ById` 例: `handleGetShopById`
  - Create: `handleCreate{Singular}` 例: `handleCreateShop`
  - Update: `handleUpdate{Singular}` 例: `handleUpdateShop`
  - Delete: `handleDelete{Singular}` 例: `handleDeleteShop`
  - ESLint rule: interactors 配下の export 関数名を AST で検査し、上記以外は error

- [ ] **property 別 update action の扱いを決める**
  - Rails には存在しない（`update(params)` 一本）
  - 現状: `handleUpdateSeatStatus`, `handleUpdateShopName`, `handleUpdateBasePrice` などに分散
  - UX 要件から来ているため、完全禁止ではなく allow list or JSDoc 明示で妥協するのが現実的

- [ ] **service 層の関数名も action と対応させる**
  - action → service の呼び出しルール（`actionHandleServiceRule`）と整合

#### 🟡 中優先: コンポーネント粒度の命名規約化

- [ ] **leaf コンポーネントの役割 suffix を allow list 化**
  - 許可: `*Form.tsx`, `*Dialog.tsx`, `*List.tsx`, `*Table.tsx`, `*Card.tsx`, `*Tabs.tsx`, `*Filters.tsx`
  - 禁止: 役割が不明瞭な名前（`Catcher.tsx`, `Shop.tsx` のようなページレベルの裸命名）
  - ESLint rule: `check-file` で filename pattern を限定
  - なんかしら根拠がないと破綻するので、あくまでも草案

- [ ] **ページレベルコンポーネントは `*Page.tsx` で統一**
  - 例: `components/pages/dashboard/Catcher.tsx` → `CatcherDashboardPage.tsx`
  - もしくは `components/pages/` 配下はすべて Page コンポーネントである契約にする
  - これも根拠弱いかも

#### 🟡 中優先: styling ハードコードの禁止

- [ ] **leaf コンポーネントで margin/padding ユーティリティをハードコード禁止**
  - 禁止: `mt-*`, `mb-*`, `ml-*`, `mr-*`, `mx-*`, `my-*`, `pt-*`, `pb-*`, `pl-*`, `pr-*`, `px-*`, `py-*` を className 文字列リテラルで書く
  - 許可: `space-y-*`, `gap-*` など "内部レイアウト" 用クラス
  - 許可パス: `src/components/shared/ui/**`（shadcn）, `src/app/**/page.tsx`, `src/components/pages/**`
  - ESLint rule: AST で JSX の className 属性の文字列リテラルを検査、正規表現でチェック
  - 根拠弱めニキ

- [ ] **その他 styling 揺れの一覧化**
  - `w-full` ハードコード（例: `auth/sign-in/Form.tsx`）
  - `space-y-4` / `space-y-8` の揺れ
  - Card wrapper の有無の揺れ
  - 段階的に規約化候補を追加
  - これらは PJ 固有になりそう。時間がある時にじっくり考えたい所存

#### 🟢 低優先: 型・schema の細かい揺れ

- [ ] **`FormState` 型名を `{動詞}{対象}FormState` に統一**
  - 現状: `SignInFormState`（動詞なし）, `UpdateShopNameFormState`, `CreateUserFormState`（動詞あり）
  - ESLint rule: TypeScript 型定義を AST で検査
  - これはありよりのあり

- [ ] **service → repository の import スタイルを統一**
  - 現状: `import * as` namespace と named import が混在
  - どちらかに統一（`import * as shopsServerRepository from "..."` 推奨）
  - ESLint rule: `no-restricted-syntax` で named import を禁止
  - あり！

### 長期的な方向性

- **`@yasainet/eslint` を Rails に学ぶ Next.js 規約集として brand 化する**
- 各規約にはドキュメントコメント（なぜこの規約か、Rails のどの思想に対応するか）を付ける
- consuming project が増えたら、規約の「推奨 / 必須」レベルを設定可能にする
- 規約違反メッセージは「修正方法」まで書く（Claude が自己修正しやすくなる）

### 設計メモ: `lib/` と `queries/` の関係

既に美しく担保されている部分なので、消さないように明文化しておく（Phase 1 命名刷新後）。

```
src/lib/*.lib.ts            ← データソース / 外部クライアントの 1 ファイル
   ↓ (generatePrefixLibMapping で自動 scan)
prefix のマスターリスト       ← 例: ["server", "client", "admin", "garage"]
   ↓ (createNamingConfigs の queryPattern に注入)
features/*/queries/{prefix}.query.ts  ← この名前以外は error
   ↓ (prefixLibPatterns で import 制約)
{prefix}.query.ts は @/lib/{prefix} 以外を import 不可
```

- 「認証コンテキスト軸」と「データソース軸」という抽象は**不要**。`lib/` にファイルがあるかどうかだけで統一的に扱える
- 新しい外部システムを足す手順は `src/lib/{name}.lib.ts` を置くだけ。ESLint が自動で `{name}.query.ts` を許可する
- この自動派生の仕組みは Rails の `connects_to` + scaffold 的予測可能性に相当する
- Phase 3 の外部サービス (Resend, Stripe, Discord) 対応は、この仕組みを拡張すればそのまま乗る可能性が高い
