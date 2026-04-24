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

### 新規 TODO（Catch プロジェクトの調査から抽出）

#### 🔴 最優先: feature 骨格の統一

- [ ] **feature 配下の 8 ディレクトリ構造を強制**
  - `actions / constants / hooks / repositories / schemas / services / types / utils` の 8 ディレクトリを全 feature で必須化
  - 使用しない場合でも空ディレクトリ（または `.gitkeep`）を置く = Rails 的な「利用しないファイルですら規約」
  - 実装: glob で feature root を検出し、存在しないディレクトリを error として報告するカスタムルール
  - 悩み: 一部 PJ では `workflows` を利用している。どうしようかな〜という気持ち。workflows には json が配置されている

- [ ] **`repositories/` と `lib/` の逆方向対応を検証**
  - すでに担保されていること:
    - `lib/*.lib.ts` を自動 scan して prefix のマスターリストを生成（`generatePrefixLibMapping`）
    - `repositories/` のファイル名は allow list に従う（`createNamingConfigs` の `repoPattern`）
    - `{prefix}.repo.ts` は対応する `lib/{prefix}` 以外を import 不可（`prefixLibPatterns`）
    - `server / client / admin`（認証コンテキスト軸）と `garage / stripe` 等（データソース軸）を区別する必要はなく、**全て `lib/*.lib.ts` からの 1:1 派生**として統一的に扱える
  - まだ担保されていないこと:
    - `lib/X.lib.ts` が存在するが、どの feature にも `X.repo.ts` が無い（= 宣言したが使っていない）
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
  - ESLint rule: actions 配下の export 関数名を AST で検査し、上記以外は error

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

### 設計メモ: `lib/` と `repositories/` の関係

既に美しく担保されている部分なので、消さないように明文化しておく。

```
src/lib/*.lib.ts            ← データソース / 外部クライアントの 1 ファイル
   ↓ (generatePrefixLibMapping で自動 scan)
prefix のマスターリスト       ← 例: ["server", "client", "admin", "garage"]
   ↓ (createNamingConfigs の repoPattern に注入)
features/*/repositories/{prefix}.repo.ts  ← この名前以外は error
   ↓ (prefixLibPatterns で import 制約)
{prefix}.repo.ts は @/lib/{prefix} 以外を import 不可
```

- 「認証コンテキスト軸」と「データソース軸」という抽象は**不要**。`lib/` にファイルがあるかどうかだけで統一的に扱える
- 新しい外部システムを足す手順は `src/lib/{name}.lib.ts` を置くだけ。ESLint が自動で `{name}.repo.ts` を許可する
- この自動派生の仕組みは Rails の `connects_to` + scaffold 的予測可能性に相当する
