# ルール一覧

`@yasainet/eslint` が提供する全ルールの意図と対処法。

---

## 共通ルール（common）

すべての環境（Next.js / Node.js / Deno）で適用される。

### コードスタイル（rules.mjs）

#### `no-console`

- **説明**: `console.log` 等の残し忘れを防ぐ。features 内では actions 以外で error に昇格する（[layers.mjs](#loggerconsole-の使用制限) 参照）
- **対象**: 全ファイル（warn）
- **NG 例**: `console.log("debug");`
- **OK 例**: logger を使用する、または actions 内で console を使う

#### `no-irregular-whitespace`

- **説明**: 全角スペースや特殊空白文字の混入を防ぐ。文字列・コメント・正規表現・テンプレート内も検査対象
- **対象**: 全ファイル
- **NG 例**: `const x =　1;`（全角スペース）
- **OK 例**: `const x = 1;`

#### `simple-import-sort/imports` / `simple-import-sort/exports`

- **説明**: import / export の並び順を自動整列し、差分ノイズを減らす
- **対象**: 全ファイル
- **NG 例**:

```ts
import { z } from "zod";
import fs from "fs";
```

- **OK 例**:

```ts
import fs from "fs";
import { z } from "zod";
```

#### `@stylistic/quotes`

- **説明**: ダブルクォートに統一。エスケープ回避時のみシングルクォート可
- **対象**: 全ファイル
- **NG 例**: `const s = 'hello';`
- **OK 例**: `const s = "hello";`

#### `@typescript-eslint/no-unused-vars`

- **説明**: 未使用変数をエラーにする。`_` プレフィックスで意図的な無視を示せる
- **対象**: `**/*.ts`, `**/*.tsx`
- **NG 例**: `const unused = 1;`
- **OK 例**: `const _unused = 1;`

#### `@typescript-eslint/consistent-type-imports`

- **説明**: 型のみの import には `import type` を強制し、バンドルサイズを削減する
- **対象**: `**/*.ts`, `**/*.tsx`
- **NG 例**: `import { User } from "./types";`（User が型のみ）
- **OK 例**: `import type { User } from "./types";`

#### `@typescript-eslint/no-explicit-any`

- **説明**: `any` の安易な使用を警告し、型安全性を保つ
- **対象**: `**/*.ts`, `**/*.tsx`
- **NG 例**: `function fn(x: any) {}`
- **OK 例**: `function fn(x: unknown) {}`

---

### 命名規則（naming.mjs）

#### ファイル名規則（`check-file/filename-naming-convention`）

features 配下の各ディレクトリでファイル名のサフィックスを強制する。prefix がある環境（Next.js の `server`, `client`, `admin` 等）ではサフィックスの前に prefix が必須。shared ディレクトリでは prefix が任意。

| ディレクトリ | パターン例 | NG 例 | OK 例 |
|---|---|---|---|
| `services/` | `{prefix}.service.ts` | `auth.ts` | `server.service.ts` |
| `repositories/` | `{prefix}.repo.ts` | `db.ts` | `server.repo.ts` |
| `actions/` | `{prefix}.action.ts` | `submit.ts` | `server.action.ts` |
| `types/` | `{feature}.type.ts` | `user.ts` | `user.type.ts` |
| `schemas/` | `{feature}.schema.ts` | `user.ts` | `user.schema.ts` |
| `utils/` | `{feature}.util.ts` | `format.ts` | `format.util.ts` |
| `constants/` | `{feature}.constant.ts` | `config.ts` | `config.constant.ts` |

#### namespace import 名（`local/namespace-import-name`）

- **説明**: `import * as` の名前を `{feature}{Scope}{Layer}` 形式に統一し、どの feature のどのレイヤーかを一目で判別できるようにする
- **対象**: `{featureRoot}/**/*.ts`
- **NG 例**:

```ts
import * as svc from "../comics/services/server.service";
```

- **OK 例**:

```ts
import * as comicsServerService from "../comics/services/server.service";
```

#### actions の export 関数名（`no-restricted-syntax`）

- **説明**: actions ファイルから export する関数は `handleXxx` 形式に統一する。エントリポイントの役割を明確にする
- **対象**: `{featureRoot}/**/actions/*.ts`
- **NG 例**:

```ts
export function getComics() {}
```

- **OK 例**:

```ts
export function handleGetComics() {}
```

#### actions と services の対応（`local/action-handle-service`）

- **説明**: `handleXxx` は対応するサービスメソッド `*.xxx()` を呼び出す必要がある。action と service の対応関係を強制する
- **対象**: `{featureRoot}/**/actions/*.ts`
- **NG 例**:

```ts
export function handleGetComics() {
  return db.query(); // service メソッドを呼んでいない
}
```

- **OK 例**:

```ts
export function handleGetComics() {
  return serverService.getComics();
}
```

#### features 内 .tsx 禁止（`no-restricted-syntax`）

- **説明**: features ディレクトリは純粋なロジック層。コンポーネントは `src/components/` に配置する
- **対象**: `{featureRoot}/**/*.tsx`
- **NG 例**: `src/features/comics/Component.tsx`
- **OK 例**: `src/components/comics/Component.tsx`

---

### レイヤー制約（layers.mjs）

#### logger/console の使用制限

- **説明**: ログ出力は actions に集約する。他レイヤーでは `console` も `logger` も禁止（error）
- **対象**: `{featureRoot}/**/*.ts`（actions を除く）
- **NG 例**:

```ts
// services/server.service.ts
console.log("debug");
logger.info("fetched");
```

- **OK 例**:

```ts
// actions/server.action.ts
logger.info("handleGetComics called");
```

#### repositories: try-catch 禁止 / if 文禁止

- **説明**: repositories は DB/API へのアクセスのみに専念する。エラーハンドリングは actions、条件分岐は services が担当する
- **対象**: `{featureRoot}/**/repositories/*.ts`
- **NG 例**:

```ts
// repositories/server.repo.ts
try {
  return await db.query();
} catch (e) {
  return null;
}
```

```ts
// repositories/server.repo.ts
if (isAdmin) {
  return await db.adminQuery();
}
```

- **OK 例**:

```ts
// repositories/server.repo.ts
export function getComics() {
  return db.query();
}
```

#### services: try-catch 禁止

- **説明**: services はビジネスロジックに専念する。エラーハンドリングは actions が担当する
- **対象**: `{featureRoot}/**/services/*.ts`
- **NG 例**:

```ts
// services/server.service.ts
try {
  return repo.getComics();
} catch (e) {
  return [];
}
```

- **OK 例**:

```ts
// services/server.service.ts
export function getComics() {
  return repo.getComics();
}
```

---

### インポート制約（imports.mjs）

#### レイヤー間の import 方向制限

- **説明**: レイヤーの依存方向を `repositories → services → actions` に強制し、循環依存を防ぐ
- **対象**: 各レイヤーのファイル

| レイヤー | import 不可 |
|---|---|
| repositories | services, actions, hooks |
| services | actions, hooks |
| actions | hooks |

- **NG 例**:

```ts
// repositories/server.repo.ts
import { getComics } from "../services/server.service"; // レイヤー違反
```

#### 横断的（lateral）import の禁止

- **説明**: 同じレイヤー同士で異なる feature の import を禁止する。feature 間の結合を防ぐ
- **対象**: repositories, services, actions
- **NG 例**:

```ts
// features/comics/services/server.service.ts
import { getUser } from "@/features/users/services/server.service"; // lateral 違反
```

- **OK 例**: shared ディレクトリ経由で共有する

#### cardinality 制約

- **説明**: `server.action` は `server.service` のみ、`client.action` は `client.service` のみを import できる。prefix の対応を強制する
- **対象**: `{featureRoot}/**/actions/{server,client,admin}.action.ts`
- **NG 例**:

```ts
// actions/server.action.ts
import * as clientService from "../services/client.service"; // cardinality 違反
```

#### lib-boundary 制約

- **説明**: `@/lib/*` は repositories と types からのみ import 可能。ライブラリの直接利用をリポジトリ層に閉じ込める
- **対象**: `src/**/*.{ts,tsx}`（lib 自身、repositories、types 等を除く）
- **NG 例**:

```ts
// services/server.service.ts
import { supabase } from "@/lib/supabase/server"; // lib-boundary 違反
```

- **OK 例**:

```ts
// repositories/server.repo.ts
import { supabase } from "@/lib/supabase/server";
```

#### prefix-lib 制約

- **説明**: `{prefix}.repo.ts` は対応する lib のみを import できる。例えば `server.repo.ts` は `lib/supabase/server` のみ
- **対象**: `{featureRoot}/**/repositories/{prefix}.repo.ts`
- **NG 例**:

```ts
// repositories/server.repo.ts
import { supabase } from "@/lib/supabase/client"; // server.repo は client lib を使えない
```

#### `@/` エイリアス vs 相対パスの使い分け（`local/import-path-style`）

- **説明**: 同一 feature 内は相対パス、feature 間は `@/` エイリアスを使う。可読性と移動の容易さを両立する
- **対象**: `src/features/**/*.ts`（Next.js のみ）
- **NG 例**:

```ts
// features/comics/actions/server.action.ts
import { getComics } from "@/features/comics/services/server.service"; // 同一 feature なのにエイリアス
```

```ts
// features/comics/actions/server.action.ts
import { getUser } from "../../users/services/server.service"; // 別 feature なのに相対パス
```

- **OK 例**:

```ts
import { getComics } from "../services/server.service"; // 同一 feature → 相対パス
import { getUser } from "@/features/users/services/server.service"; // 別 feature → エイリアス
```

---

### JSDoc（jsdoc.mjs）

#### `jsdoc/require-jsdoc` / `jsdoc/require-description`

- **説明**: public な関数には JSDoc と説明を必須にする。repositories, services, utils のインターフェースを明確にする
- **対象**: `{featureRoot}/**/repositories/*.ts`, `**/services*/*.ts`, `**/utils*/*.ts`
- **NG 例**:

```ts
export function getComics() {
  return db.query();
}
```

- **OK 例**:

```ts
/** Fetch all published comics from the database. */
export function getComics() {
  return db.query();
}
```

---

## Next.js 固有ルール

`@yasainet/eslint/next` で追加適用される。featureRoot は `src/features`。

### hooks 命名（`check-file/filename-naming-convention` / `no-restricted-syntax`）

- **説明**: hooks ファイルは `useXxx.ts` 形式、export する関数は `useXxx` 形式に統一する
- **対象**: `src/features/**/hooks/*.ts`
- **NG 例**: `fetchData.ts`, `export function fetchData() {}`
- **OK 例**: `useAuth.ts`, `export function useAuth() {}`

### components: PascalCase / .tsx 限定

- **説明**: コンポーネントファイルは PascalCase かつ `.tsx` 限定。ロジックは features に分離する
- **対象**: `src/components/**/*.tsx`（shared/ui を除く）、`src/components/**/*.ts`
- **NG 例**: `button.tsx`, `src/components/Helper.ts`
- **OK 例**: `Button.tsx`, `ComicsList.tsx`

### directives（`no-restricted-syntax`）

- **説明**: Server Actions / Client Components のディレクティブを強制する

| ファイル | 必要なディレクティブ |
|---|---|
| `server.action.ts` | `"use server"` 必須 |
| `admin.action.ts` | `"use server"` 必須 |
| `client.action.ts` | `"use server"` 禁止 |
| `hooks/*.ts` | `"use client"` 必須 |

- **NG 例**:

```ts
// actions/server.action.ts
import { ... } from "..."; // "use server" がない
```

- **OK 例**:

```ts
// actions/server.action.ts
"use server";
import { ... } from "...";
```

### import パススタイル（`local/import-path-style`）

- **説明**: 同一 feature 内は相対パス、feature 間は `@/` エイリアス。[インポート制約](#-エイリアス-vs-相対パスの使い分けlocalimport-path-style)を参照
- **対象**: `src/features/**/*.ts`

---

## Node.js 固有ルール

`@yasainet/eslint/node` で適用。featureRoot は `scripts/features`。

### `@/` エイリアス禁止

- **説明**: Node.js 環境では `@/` エイリアスが使えないため、相対パスを強制する
- **対象**: `scripts/features/**/*.ts`
- **NG 例**: `import { foo } from "@/features/bar";`
- **OK 例**: `import { foo } from "../bar/services/server.service";`

---

## Deno 固有ルール

`@yasainet/eslint/deno` で適用。featureRoot は `supabase/functions/_features`。

### `@/` エイリアス禁止

- **説明**: Deno 環境では `@/` エイリアスが使えないため、相対パスを強制する
- **対象**: `supabase/functions/_features/**/*.ts`

### `_lib/` の boundary 制約

- **説明**: `_lib/` は repositories と types からのみ import 可能。Next.js の `@/lib` 制約と同等
- **対象**: `supabase/functions/**/*.ts`（`_lib/` 自身、repositories、types を除く）
- **NG 例**:

```ts
// services/server.service.ts
import { supabase } from "../../_lib/supabase";
```

- **OK 例**:

```ts
// repositories/server.repo.ts
import { supabase } from "../../_lib/supabase";
```

### commands エントリポイント制約

- **説明**: `commands/` は actions のみを import できる。services、repositories、`_lib/` の直接 import を禁止し、actions をエントリポイントとする
- **対象**: `supabase/functions/commands/**/*.ts`
- **NG 例**:

```ts
// commands/sync.ts
import { getComics } from "../_features/comics/services/server.service";
```

- **OK 例**:

```ts
// commands/sync.ts
import { handleSyncComics } from "../_features/comics/actions/server.action";
```
