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

### 3 層命名刷新（段階実装 - 2026-04-25 整理）

> [!NOTE]
> Phase 1 ✅ 完了 / Phase 2 ✅ 完了 / Phase 3 🟢 大半解決済 / Phase 4 🔵 保留。アクティブな個別 TODO は本ファイル末尾を参照。

#### 背景

- 前提思想: 人間はコードを読まない（JSDoc のみ）。LLM が生成する。ゆえにボイラープレートはノーコスト
- 現状の命名は歴史的経緯（web app は server-first だった → "actions" = Server Actions）。責務と名前の整合が取れていない
- 名前は LLM への指示である。コードの**位置（どの層にあるか）が意図を表す最大の装置**になるので、名前は「響き」ではなく「LLM が誤解せず、lint が縛りきれるか」で決める
- Rails から借りるのは **community pattern (thin)** であり **core 用語 (fat)** ではない。Rails core (Model, Controller) は fat で yasainet の thin layer と合わない

#### Phase 1: ディレクトリ名・ファイル名 + `handle*` prefix 撤廃 ✅ 完了 (2026-04-25)

**実装ステータス:**

- ✅ `@yasainet/eslint` v0.0.51 publish 済（GitHub Actions 経由で npm publish 完了）
- ✅ migration scripts: `~/Projects/eslint/scripts/migrate-phase1.mjs`, `~/Projects/eslint/scripts/migrate-handle-prefix.mjs`
- 🟡 他 consuming project（catch, pornfusion, chuchu, oyatsu 等）への展開待ち
  - 各 PJ で `node ~/Projects/eslint/scripts/migrate-phase1.mjs --apply` を実行
  - features root が複数ある場合は `--dir scripts/features` 等で追加実行
  - その後 `node ~/Projects/eslint/scripts/migrate-handle-prefix.mjs --apply`

| 旧               | 新                | 変更    | 根拠                                                       |
| ---------------- | ----------------- | ------- | ---------------------------------------------------------- |
| `repositories/`  | `queries/`        | ✅ 変更 | Rails Query Object と対応。DDD の Repository 概念を避ける  |
| `*.repo.ts`      | `*.query.ts`      | ✅ 変更 | ディレクトリ名と一致                                       |
| `services/`      | `services/`       | 維持    | Rails Service Object と一致。TS で `models` は schema 連想 |
| `*.service.ts`   | `*.service.ts`    | 維持    | 同上                                                       |
| `actions/`       | `interactors/`    | ✅ 変更 | Rails Interactor と責務完全一致。`handlers/` は Route 衝突 |
| `*.action.ts`    | `*.interactor.ts` | ✅ 変更 | ディレクトリ名と一致                                       |
| `handle*` prefix | (撤廃)            | ✅ 変更 | namespace import で disambiguate 済み、prefix は情報冗長   |

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

#### Phase 2: 関数名の allow list 化（queries 限定） ✅ 完了 (2026-04-25)

**前提（既決事項）:**

- `handle*` prefix は Phase 1 で完全撤廃済（lint ルール削除 + 既存コードからも削除）
- Phase 2 は **queries 層のみに allow list を導入する**（services / interactors は MVP 段階では保留 → Phase 4 に繰り延べ）

##### スコープ縮小の根拠（2026-04-25 決定）

最初の構想は「3 層共通の動詞 allow list」だったが、以下の理由で **queries のみ** に絞り込んだ:

1. **MVP 段階では帰納に十分なサンプルがない**
   - 現状 consuming project は MVP 規模。services / interactors の動詞を「将来 N 個の PJ で通用する allow list」として演繹的に決めるのは不可能
   - 実物のコードが N 個以上溜まってから帰納するのが正道（YAGNI 原則）
2. **queries 層は外部制約により動詞が自然に収束する**
   - SQL / HTTP リクエストという外部 I/O が動詞の表現力を制約する
   - `get / create / update / delete` ＋ auth 特殊（`signUp / signIn / signOut`）でほぼ網羅可能
3. **services はビジネスロジックゆえ動詞の幅が広い**
   - 述語 (`is/can/should`)、計算 (`calculate/aggregate`)、整形 (`format/build`)、状態遷移 (`publish/archive`) など多彩
   - 想像で allow list を作ると現実とズレる → 後で必ず緩めることになる
4. **interactors も auth 系以外の動詞が未成熟**
   - `search / toggle / process` 等は既出だが、まだ揺れの幅を観測しきれていない

##### 採用する allow list（A2: TS idiomatic）

```js
// queries 層のみに適用
const QUERIES_ALLOW = /^(get|create|update|delete|signUp|signIn|signOut)/;
```

- **CRUD**: `get / create / update / delete` （`get` には `getXById`, `getXBy*`, `getXPaginated` 等の variant を許可）
- **auth 特殊**: `signUp / signIn / signOut` （Supabase / OAuth 等の業界慣習）
- **why コメント**: `// queries layer verbs are the TS-idiomatic translation of Rails 5 actions (index/show/create/update/destroy)` を JSDoc に記載

##### Rails との対応関係（README に記載）

| Rails 5 actions | TS idiomatic (採用) | 備考                                          |
| --------------- | ------------------- | --------------------------------------------- |
| `index`         | `getXs()`           | `index` は `index.tsx` 等と混同するため `get` |
| `show`          | `getXById(id)`      | 単複は引数有無で判別                          |
| `create`        | `createX(input)`    | 一致                                          |
| `update`        | `updateX(input)`    | 一致                                          |
| `destroy`       | `deleteX(id)`       | JS 慣習は `delete`                            |

##### Phase 2 実装ステップ

1. ✅ CLAUDE.md 更新
2. ✅ `@yasainet/eslint` に AST ルール `naming/queries-export` を追加
3. ✅ `naming.mjs` の `createNamingConfigs` から新ルールを呼び出す
4. ✅ v0.0.52 として publish
5. ✅ bitcomic.net で dogfood (13 関数 rename, lint/type-check/build pass)

##### 実証データ（2026-04-25）

| PJ           | queries 関数数 | 違反数 | rename 例                                                                                 |
| ------------ | -------------- | ------ | ----------------------------------------------------------------------------------------- |
| bitcomic.net | ~35            | 13     | `searchComics`→`getComicsByQuery`, `addLike`→`createLike`, `uploadImage`→`createImage` 等 |
| getpayme.net | ~48            | 0      | （rename 不要、最初から allow list 通過）                                                 |

**示唆:**

- 大規模 MVP（Lightning payment 統合あり）でも allow list は緩める必要なし
- 違反が出るのは「初期に揺れた命名（add/remove, find, list, upload）」が残った PJ のみ
- 一度 rename すれば、以降の Claude 生成は規約内に収束する（lint で強制されるため）

##### 後回しにしたもの（Phase 4 候補）

- **論点 B**: index/list variant の表現方法（メソッド分化 vs options 集約）→ B1 が暗黙の現状維持
- **論点 C**: `getUser()` → `me()` rename → 必要性は実物が増えてから判断
- **論点 D**: property 別 update の扱い（`updateShopName` 等）→ services / interactors の議論と一緒
- **services / interactors の動詞 allow list** → 実物が N 個以上溜まってから帰納

#### Phase 3: 外部サービス対応 🟢 大半が実質解決済（templates のみ未決）

**実証された解決策（getpayme.net 2026-04-25）:**

| 元論点                   | 状態       | 実例                                                              |
| ------------------------ | ---------- | ----------------------------------------------------------------- |
| 論点 A: 配置レイヤ       | ✅ 解決    | `shared/queries/resend.query.ts`, `shared/queries/lnurl.query.ts` |
| 論点 B: feature の切り方 | ✅ 解決    | `shared/queries/` で十分。専用 feature は不要                     |
| 論点 D: 動詞 allow list  | ✅ D1 採用 | `createEmail`, `createInvoice`, `getVerifyStatus` で CRUD 流用    |
| 論点 C: templates の扱い | 🟡 未決    | React Email を採用する PJ が出たら再開                            |

**残る作業（templates 採用時のみ）:**

- `templates/` 専用ディレクトリ案 (旧 C2) を実装する場合、`naming.mjs` に `templates/*.template.tsx` の glob を追加

#### Phase 4: services / interactors の動詞 allow list 化 🔵 保留中

**前提:**

- Phase 2 で queries 層のみ allow list 強制を導入する判断をした
- services / interactors は MVP 段階では allow list を保留

**保留理由:**

- services はビジネスロジックゆえ動詞の幅が広い（述語・計算・整形・状態遷移など）
- interactors も auth 系以外の動詞 (`search/toggle/process` 等) はまだ揺れの幅を観測しきれていない
- 想像で allow list を作ると現実とズレ、後で必ず緩める羽目になる
- 「実物が N 個以上溜まってから帰納する」のが正道（YAGNI 原則）

**開始条件（このいずれかを満たしたら検討）:**

- consuming project が 5 個以上で services / interactors の動詞分布が観測できる
- 同じ意味の関数が異なる動詞で書かれて grep / nav の苦痛が出始める
- LLM 生成で「services の述語動詞」が予測不能になり始める

**準備 TODO:**

- 各 consuming project の `**/services/*.service.ts`, `**/interactors/*.interactor.ts` から export 関数名を集計するスクリプトを書き、動詞の頻度分布を観測する
- 観測結果から allow list 候補を帰納する
- 「services は層別に動詞 allow list を分ける」案 (B2) を再評価する

##### 観測サンプル: getpayme.net interactors（2026-04-25 抽出）

CRUD 以外の動詞:

```
onboarding         (creators)         — 名詞動詞化、Auth ceremony と同じ業務固有語
disconnect         (purchases)        — Lightning 接続切断
forceSettle        (purchases)        — 強制状態遷移
check              (purchases)        — Lightning payment 確認
verify             (purchases)        — purchase 検証
strip              (product-contents) — Content metadata 除去
```

合成名詞（CRUD ベース + 業務語）:

```
getSalesDashboard  (purchases)
checkLightningPayment, verifyLightningPurchase
forceSettleLightningPurchase, disconnectLightning
```

**示唆（Phase 4 の判断を補強）:**

- 業務固有動詞 (`onboarding`, `disconnect`, `verify`, `strip`) は LLM への事前 allow list 化が困難
- 「業務語をそのまま動詞にする」が現実解。一律規約より JSDoc + 命名一貫性 (camelCase) で十分
- queries は CRUD で「物理的書き込み」、interactors は業務語で「意図」を表現する棲み分けが実装で確認できる
  - 例: `updateLightningPurchaseSettled` (queries: 状態列を update) ↔ `forceSettleLightningPurchase` (interactor: 業務動詞 settle)

#### 責務の 1 行定義（Phase 1 決定版）

- **queries**: 外部データソースへの 1 回のリクエストをカプセル化する（入: プリミティブ / 出: raw response）
- **services**: ドメインモデルを構築する（入: プリミティブ / 出: domain type + error）
- **interactors**: 外部入力を受け取りドメインロジックへ委譲し、観測と例外を吸収する（入: 外部入力 / 出: UI 消費可能な形）

#### 責務マトリクス（Phase 1 決定版）

| 項目                          | queries    | services   | interactors       |
| ----------------------------- | ---------- | ---------- | ----------------- |
| try-catch                     | ❌         | ❌         | ✅                |
| if 文                         | ❌         | ✅         | ✅                |
| for/while                     | ❌         | ✅         | ✅                |
| throw                         | ❌         | ❌         | ❌                |
| logger                        | ❌         | ❌         | ✅                |
| mapSnakeToCamel               | ❌         | ✅         | ❌                |
| redirect                      | ❌         | ❌         | ✅                |
| 他 feature の同層 import      | ❌         | ❌         | ❌                |
| lib/\*.lib.ts 直接 import     | ✅         | ❌         | ❌                |
| 関数名 prefix                 | なし       | なし       | なし              |
| 動詞 allow list               | ✅ Phase 2 | ⏳ Phase 4 | ⏳ Phase 4        |
| `"use server"` ディレクティブ | N/A        | N/A        | server/admin のみ |

### アクティブな TODO（2026-04-25 整理後）

実装根拠が明確で、低コストで価値があるものに絞り込み済み。削除した TODO の判断履歴は git log を参照。

- [x] **`@typescript-eslint/no-unnecessary-condition` を `warn` から `error` に昇格** ✅ v0.0.53
  - bitcomic.net / getpayme.net で warning 0 を確認後、`src/common/rules.mjs` で昇格

- [x] **`FormState` 型名を `{動詞}{対象}FormState` に統一** ✅ v0.0.53
  - `local/form-state-naming` ルール追加
  - 単純な `^[A-Z][a-z]+[A-Z]\w*FormState$` で「2 PascalCase 単語以上 + FormState」を強制
  - 動詞 allow list を持たないことで Phase 4 (services/interactors の動詞議論) を待たずに導入可能

- [x] **queries layer の import スタイルを namespace import に強制** ✅ v0.0.53
  - `local/queries-namespace-import` ルール追加
  - `import type` は許容（`ComicInsert` 等の型再利用パターン）
  - value の named import のみ禁止

- [x] **`@yasainet/eslint/deno` の type-aware ルールを opt-out 可能に**
  - 背景: Deno files (Supabase Edge Functions) は consumer の `tsconfig.json` から exclude されており、`projectService: true` が parsing error を起こす。pornfusion.com で発覚
  - `createCommonConfigs(featureRoot, { typeAware = true, rulesFiles })` を追加
  - `deno` entry は `typeAware: false` + `rulesFiles: ["supabase/functions/**/*.ts"]` を渡す
  - `typeAware: false` のとき:
    - `parserOptions: { projectService: false, project: null }` で parsing error を回避
    - type-aware ルール（`no-unnecessary-condition`/`no-floating-promises`/`no-unsafe-*` 等）を明示的に `off`
    - `layers/no-any-return`（型情報が必要）も除外
  - `rulesFiles` を narrow にすることで、`next` + `node` + `deno` を組み合わせても deno の override が他 entry の files を侵食しない
  - consuming 側（pornfusion.com）の workaround 24 行を削除可能

<details>
<summary>削除した TODO（2026-04-25）</summary>

- 8 ディレクトリ強制: 空ディレクトリは LLM ノイズ、`workflows` 等の例外もあり実装の落とし所が困難
- queries/lib 逆方向対応 (lib にあって query に無い検出 / マニフェスト宣言): 過剰設計の懸念
- CRUD 関数名 Rails scaffold 化 / property 別 update / service 層も対応: Phase 2 + Phase 4 に統合済
- leaf component suffix allow list / `*Page.tsx` 統一: 自己評価「根拠弱い」
- margin/padding ハードコード禁止 / styling 揺れ一覧化: 自己評価「根拠弱め」「PJ 固有」

</details>

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
