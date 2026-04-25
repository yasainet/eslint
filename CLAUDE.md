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
> Phase 1 ✅ 完了 / Phase 2 🟡 協議中 / Phase 3 🔴 未着手。Phase 2/3 は **下記の選択肢一覧から決定して進める**。

#### 背景

- 前提思想: 人間はコードを読まない（JSDoc のみ）。LLM が生成する。ゆえにボイラープレートはノーコスト
- 現状の命名は歴史的経緯（web app は server-first だった → "actions" = Server Actions）。責務と名前の整合が取れていない
- 名前は LLM への指示である。コードの**位置（どの層にあるか）が意図を表す最大の装置**になるので、名前は「響き」ではなく「LLM が誤解せず、lint が縛りきれるか」で決める
- Rails から借りるのは **community pattern (thin)** であり **core 用語 (fat)** ではない。Rails core (Model, Controller) は fat で yasainet の thin layer と合わない

#### Phase 1: ディレクトリ名・ファイル名 + `handle*` prefix 撤廃 ✅ 完了 (2026-04-25)

**実装ステータス:**

- ✅ `@yasainet/eslint` v0.0.51 publish 済（GitHub Actions 経由で npm publish 完了）
- ✅ migration scripts: `~/Projects/eslint/scripts/migrate-phase1.mjs`, `~/Projects/eslint/scripts/migrate-handle-prefix.mjs`
- ✅ REDACTED で dogfood 完了（preview branch に 3 commits split: rename / handle 撤廃 / lint cleanup）
- 🟡 他 consuming project（catch, pornfusion, chuchu, oyatsu 等）への展開待ち
  - 各 PJ で `node ~/Projects/eslint/scripts/migrate-phase1.mjs --apply` を実行
  - features root が複数ある場合は `--dir scripts/features` 等で追加実行
  - その後 `node ~/Projects/eslint/scripts/migrate-handle-prefix.mjs --apply`

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

#### Phase 2: 関数名の allow list 化 🟡 協議中

**前提（既決事項）:**

- `handle*` prefix は Phase 1 で完全撤廃済（lint ルール削除 + 既存コードからも削除）
- 現状の REDACTED interactor 関数名は `getComics()`, `signIn()`, `searchComics()` 等の動詞のみ
- Phase 2 のゴール: **動詞の allow list を lint で強制し、3 層全てに適用する**

**ゴールの優先順位:**

1. LLM 生成の予測可能性（同じ意味の関数を毎回同じ名前で生成）
2. grep / nav の ergonomics
3. Rails への思想的整合（必須ではない）

---

##### 論点 A: 動詞 allow list の方針

| 案 | 例 | メリット | デメリット |
|---|---|---|---|
| **A1: Rails literal** | `index / show / create / update / destroy` | Rails 完全一致、最も予測可能 | `index` は JS で混同、`destroy` は JS 慣習と異なる、現状コードと乖離大 |
| **A2: TS idiomatic** ⭐ | `getX / createX / updateX / deleteX` | TS/JS 慣習、grep しやすい、REDACTED 現状とほぼ一致 | Rails 純度は薄い |
| **A3: 混合** | `index/show` + `create/update/delete` | 折衷 | 一貫性なし |

**推し: A2（TS idiomatic）**。REDACTED で既に動いており migration コストゼロ。

##### 論点 B: index/list variant の表現方法

`getComicsByCircle`, `getComicsByCirclePaginated` のようなフィルタ・ページネーション付き取得をどう書くか。

| 案 | 例 | メリット | デメリット |
|---|---|---|---|
| **B1: メソッド分化** ⭐ | `getComics()`, `getComicsByCircle(circle)`, `getComicsByCirclePaginated(circle, page, pageSize)` | 戻り値型がシンプル、LLM 予測可能性高い、REDACTED 現状 | 関数数が多い |
| **B2: options 集約** | `getComics({ circle?, author?, tag?, page?, pageSize? })` | 関数数最小、Rails controller 風 | 戻り値型が条件付き、option 組み合わせを LLM が誤用するリスク |
| **B3: 混合** | 基本は分化、ページネーションだけ options | ページネーションが optional として自然 | 一貫性なし |

**推し: B1（分化、現状維持）**。LLM の予測可能性を最優先。

##### 論点 C: auth の「現在のユーザー取得」関数名

REDACTED の `auth/interactors/client.interactor.ts` で `getUser()` として実装中。意味が曖昧（ID 指定の getUser と紛らわしい）なので変えたい。

| 案 | 例 | 根拠 |
|---|---|---|
| **C1: `current()`** | `await authClientInteractor.current()` | 「現在のユーザー」を明示、Rails-like |
| **C2: `me()`** ⭐ | `await authClientInteractor.me()` | GitHub API / Twitter API の `/me` endpoint 慣習、短い |
| **C3: `getCurrentUser()`** | 説明的 | 長い、prefix 撤廃方針と矛盾 |
| **C4: 現状 `getUser()` 維持** | 現状 | ID 指定の `getUser(id)` と紛らわしい |

**推し: C2（`me`）**。短く、業界慣習に沿う。

##### 論点 D: property 別 update の扱い

Rails には存在しないパターン（`update(params)` 一本）だが、UX 要件で `updateShopName(input)`, `updateBasePrice(input)` のように分離したい場合がある。

| 案 | メリット | デメリット |
|---|---|---|
| **D1: 完全禁止**（`update(input)` 一本） | Rails 純度 | UX 上「name のみ更新」UI が冗長になる |
| **D2: allow list で許可** ⭐ | UX 要件に沿う、実装コスト低 | 関数数が増える |
| **D3: JSDoc で意図明示**（lint は許可） | 妥協案 | lint が緩くなる |

**推し: D2**。UX 要件は無視できない。

##### 論点 E: lint 正規表現の最終形

A2（TS idiomatic）+ B1（分化）+ C2（me）+ D2 を採用した場合のドラフト:

```js
// 3 層共通の allow list (queries / services / interactors)
const CRUD_VERBS = /^(get|create|update|delete)/;     // get, getX, getXById, getXBy*, getX*Paginated, etc.
const AUTH_VERBS = /^(signUp|signIn|signOut|me)$/;    // 完全一致
const CUSTOM_ACTIONS = /^(search|toggle|process|cleanup|checkDiff|notify|charge|send|refund|subscribe)/;  // 拡張可能リスト
```

REDACTED の現状関数名（一部抜粋）はこの正規表現で全てパス:

- `getComics`, `getComicById`, `getComicsByCircle`, `getComicsByCirclePaginated`, `getAllComics` → `CRUD_VERBS` (`get`)
- `createComment`, `createContact` → `CRUD_VERBS` (`create`)
- `signUp`, `signIn`, `signOut` → `AUTH_VERBS`
- `searchComics`, `toggleLike`, `processUrl`, `cleanup`, `checkDiff` → `CUSTOM_ACTIONS`
- `getUser` (auth current) → C2 採用なら `me` に rename

---

##### Phase 2 実装ステップ（決定後）

1. `@yasainet/eslint` に lint ルール追加: `naming/queries-export`, `naming/services-export`, `naming/interactors-export`（同じ allow list を 3 層に適用）
2. v0.0.52 として publish
3. consuming project で違反検出 → 必要なら個別 rename
4. REDACTED で C2 採用なら `getUser` → `me` を rename

#### Phase 3: 外部サービス対応 🔴 未着手

**前提（既存システムで担保済み）:**

- `queries/` は既に Supabase 専用ではなく、`garage.query.ts` 等の S3 系を許容
- `generatePrefixLibMapping` により `lib/X.lib.ts` を置けば自動で `queries/X.query.ts` が許可される
- つまり**アーキテクチャ的には resend/stripe/discord も既に乗る**。残るのは「配置場所と命名 semantic」の整理

**過去プロジェクトでの揺れ（統一規約なし）:**

- `pornfusion.com`: `features/shared/` に resend 関連
- `chuchu`: `features/shared/` + `templates/` 概念
- `oyatsu`: `resend.util.ts` を utils に配置

---

##### 論点 A: 配置レイヤ

| 案 | 例 | メリット | デメリット |
|---|---|---|---|
| **A1: queries/ に統合** ⭐ | `features/notifications/queries/resend.query.ts` の `send()` | アーキテクチャ一貫、prefix システム流用 | 「query」と "send email" が semantic に合わない |
| **A2: 新レイヤ `commands/`** | `features/notifications/commands/resend.command.ts` の `send()` | CQRS 風、semantic 純度 | レイヤ増（4 層に）、ESLint 追加コスト |
| **A3: shared/ に集約** | `features/shared/queries/resend.query.ts` | 横断利用に対応 | shared が肥大 |
| **A4: utils/ 配置** | `utils/resend.util.ts` | 軽量 | 層構造を回避する誘惑 |

**推し: A1（queries/ 統合）**。queries の意味を「外部データソースとの 1 リクエスト」と再定義すれば semantic 整合。レイヤ数を増やさない。

##### 論点 B: feature の切り方

| 案 | 例 | メリット | デメリット |
|---|---|---|---|
| **B1: 専用 feature** ⭐ | `features/notifications/` (resend, discord), `features/payments/` (stripe) | ドメイン分離明確、拡張性 | サービスごとに feature が増える |
| **B2: shared に集約** | `features/shared/queries/resend.query.ts` 等 | 1 箇所 | shared 肥大 |
| **B3: 使う feature 内に配置** | `features/users/queries/resend.query.ts` (パスワードリセット用) | 利用箇所と近い | 重複リスク |

**推し: B1（専用 feature）**。`notifications`, `payments`, `notifications/discord` 等で feature 化。

##### 論点 C: templates の扱い

メール本文・Discord embed・Stripe invoice item 等のテンプレート。

| 案 | 例 |
|---|---|
| **C1: types/ 配置** | `features/notifications/types/templates.type.ts` |
| **C2: 新 templates/ ディレクトリ** ⭐ | `features/notifications/templates/welcome.template.tsx` |
| **C3: constants/ 配置** | `features/notifications/constants/templates.constant.ts` |
| **C4: interactors にインライン** | テンプレートは個別関数の中で組み立て |

**推し: C2（templates/ 専用ディレクトリ）**。chuchu の前例あり、React Email 使うなら .tsx になり types/ や constants/ には入れにくい。

##### 論点 D: 関数名 allow list の拡張

外部サービス向け動詞を Phase 2 の allow list にどう追加するか。

| 案 | 例 |
|---|---|
| **D1: CRUD verbs 流用** | `createMessage()` for resend send |
| **D2: 動詞追加** ⭐ | `send`, `notify`, `charge`, `refund`, `subscribe` を `CUSTOM_ACTIONS` に追加 |
| **D3: サービス専用動詞**（個別管理） | resend: `send`, stripe: `charge/refund`, discord: `notify` |

**推し: D2**。allow list が 10 程度に増えるが管理可能。

---

##### Phase 3 実装ステップ（決定後）

1. `lib/` に `resend.lib.ts`, `stripe.lib.ts`, `discord.lib.ts` を配置（既存 prefix システムに乗る）
2. 配置・命名規約を CLAUDE.md / README.md に明記
3. 新 lint ルール追加（`templates/` ディレクトリの存在チェック等、必要なら）
4. 一つの consuming project（pornfusion or chuchu）で dogfood
5. 他に展開

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
