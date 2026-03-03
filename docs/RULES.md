# ルール一覧

`@yasainet/eslint` が提供する全ルールの意図と対処法。

---

## 共通ルール（common）

すべての環境（Next.js / Node.js / Deno）で適用される。

### コードスタイル（rules.mjs）

#### `no-console`

- **説明**: `console.log` の残し忘れを防ぐ。features 内では actions 以外で error に昇格する（[layers.mjs](#loggerconsole-の使用制限) 参照）
- **対象**: 全ファイル（warn）
- **NG 例**:

```ts
// services/server.service.ts
console.log("debug");
```

- **OK 例**:

```ts
// actions/server.action.ts
logger.info("handleGetComics called");
```

#### `no-irregular-whitespace`

- **説明**: 全角スペースや特殊空白文字の混入を防ぐ。文字列・コメント・正規表現・テンプレート内も検査対象
- **対象**: 全ファイル
- **NG 例**: `const x =　1;`（全角スペース）, `if (flag)　{`（全角スペース）, `return　value;`（全角スペース）
- **OK 例**: `const x = 1;`, `if (flag) {`, `return value;`

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
- **NG 例**: `const s = 'hello';`, `import { z } from 'zod';`, `const key = 'user_id';`
- **OK 例**: `const s = "hello";`, `import { z } from "zod";`, `const key = "user_id";`

#### `@typescript-eslint/no-unused-vars`

- **説明**: 未使用変数をエラーにする。`_` プレフィックスで意図的な無視を示せる
- **対象**: `**/*.ts`, `**/*.tsx`
- **NG 例**: `const unused = 1;`, `const data = fetchData();`（data 未使用）, `const { a, b } = obj;`（b 未使用）
- **OK 例**: `const _unused = 1;`, `const _data = fetchData();`, `const { a, _b } = obj;`

#### `@typescript-eslint/consistent-type-imports`

- **説明**: 型のみの import には `import type` を強制し、バンドルサイズを削減する
- **対象**: `**/*.ts`, `**/*.tsx`
- **NG 例**:

```ts
import { User } from "./types"; // User が型のみ
```

- **OK 例**:

```ts
import type { User } from "./types";
```

#### `@typescript-eslint/no-explicit-any`

- **説明**: `any` の安易な使用を警告し、型安全性を保つ
- **対象**: `**/*.ts`, `**/*.tsx`
- **NG 例**: `function fn(x: any) {}`, `const data: any = fetchData()`, `function parse(input: any): any {}`
- **OK 例**: `function fn(x: unknown) {}`, `const data: Comic[] = fetchData()`, `function parse(input: string): Result {}`

---

### 命名規則（naming.mjs）

#### ファイル名規則（`check-file/filename-naming-convention`）

features 配下の各ディレクトリでファイル名のサフィックスを強制する。ルールは環境と対象ディレクトリで異なる。

##### prefix あり環境（Next.js / Node.js）

prefix（`server`, `client`, `admin`）は `{libRoot}/*.lib.ts` から自動検出される。

**通常ディレクトリ** — 検出された prefix のみ許可：

| ディレクトリ    | パターン              | OK 例               | NG 例              |
| --------------- | --------------------- | ------------------- | ------------------ |
| `services/`     | `{prefix}.service.ts` | `server.service.ts` | `auth.service.ts`  |
|                 |                       | `client.service.ts` | `service.ts`       |
|                 |                       | `admin.service.ts`  | `auth.ts`          |
| `repositories/` | `{prefix}.repo.ts`    | `server.repo.ts`    | `db.repo.ts`       |
|                 |                       | `client.repo.ts`    | `repo.ts`          |
|                 |                       | `admin.repo.ts`     | `db.ts`            |
| `actions/`      | `{prefix}.action.ts`  | `server.action.ts`  | `submit.action.ts` |
|                 |                       | `client.action.ts`  | `action.ts`        |
|                 |                       | `admin.action.ts`   | `submit.ts`        |

**shared ディレクトリ** — 検出された prefix または `shared` を許可：

| ディレクトリ           | パターン                      | OK 例               | NG 例               |
| ---------------------- | ----------------------------- | ------------------- | ------------------- |
| `shared/services/`     | `{prefix\|shared}.service.ts` | `shared.service.ts` | `auth.service.ts`   |
|                        |                               | `server.service.ts` | `common.service.ts` |
|                        |                               | `client.service.ts` | `service.ts`        |
| `shared/repositories/` | `{prefix\|shared}.repo.ts`    | `shared.repo.ts`    | `db.repo.ts`        |
|                        |                               | `server.repo.ts`    | `common.repo.ts`    |
|                        |                               | `client.repo.ts`    | `repo.ts`           |
| `shared/actions/`      | `{prefix\|shared}.action.ts`  | `shared.action.ts`  | `submit.action.ts`  |
|                        |                               | `server.action.ts`  | `common.action.ts`  |
|                        |                               | `client.action.ts`  | `action.ts`         |

##### prefix なし環境（Supabase Edge Functions）

`{libRoot}/` に `.lib.ts` がない場合、prefix は不要になる。

**通常ディレクトリ** — 任意の名前 + サフィックス：

| ディレクトリ    | パターン       | OK 例                | NG 例         |
| --------------- | -------------- | -------------------- | ------------- |
| `services/`     | `*.service.ts` | `comics.service.ts`  | `comics.ts`   |
|                 |                | `auth.service.ts`    | `service.ts`  |
|                 |                | `payment.service.ts` | `auth.svc.ts` |
| `repositories/` | `*.repo.ts`    | `comics.repo.ts`     | `comics.ts`   |
|                 |                | `auth.repo.ts`       | `repo.ts`     |
|                 |                | `payment.repo.ts`    | `auth.db.ts`  |
| `actions/`      | `*.action.ts`  | `comics.action.ts`   | `comics.ts`   |
|                 |                | `auth.action.ts`     | `action.ts`   |
|                 |                | `payment.action.ts`  | `auth.act.ts` |

**shared ディレクトリ** — `shared` 固定：

| ディレクトリ           | パターン            | OK 例               | NG 例               |
| ---------------------- | ------------------- | ------------------- | ------------------- |
| `shared/services/`     | `shared.service.ts` | `shared.service.ts` | `comics.service.ts` |
|                        |                     |                     | `auth.service.ts`   |
|                        |                     |                     | `common.service.ts` |
| `shared/repositories/` | `shared.repo.ts`    | `shared.repo.ts`    | `comics.repo.ts`    |
|                        |                     |                     | `auth.repo.ts`      |
|                        |                     |                     | `common.repo.ts`    |
| `shared/actions/`      | `shared.action.ts`  | `shared.action.ts`  | `comics.action.ts`  |
|                        |                     |                     | `auth.action.ts`    |
|                        |                     |                     | `common.action.ts`  |

##### 共通レイヤー（環境問わず）

以下のレイヤーは prefix に依存せず、`{feature}.{suffix}.ts` 形式で統一される。

| ディレクトリ | パターン例              | OK 例                | NG 例              |
| ------------ | ----------------------- | -------------------- | ------------------ |
| `types/`     | `{feature}.type.ts`     | `user.type.ts`       | `user.ts`          |
|              |                         | `comic.type.ts`      | `types.ts`         |
|              |                         | `payment.type.ts`    | `comic.d.ts`       |
| `schemas/`   | `{feature}.schema.ts`   | `user.schema.ts`     | `user.ts`          |
|              |                         | `comic.schema.ts`    | `schemas.ts`       |
|              |                         | `payment.schema.ts`  | `comic.zod.ts`     |
| `utils/`     | `{feature}.util.ts`     | `format.util.ts`     | `format.ts`        |
|              |                         | `date.util.ts`       | `utils.ts`         |
|              |                         | `string.util.ts`     | `format.helper.ts` |
| `constants/` | `{feature}.constant.ts` | `config.constant.ts` | `config.ts`        |
|              |                         | `api.constant.ts`    | `constants.ts`     |
|              |                         | `env.constant.ts`    | `config.const.ts`  |

#### namespace import 名（`local/namespace-import-name`）

- **説明**: `import * as` の名前を `{feature}{Scope}{Layer}` 形式に統一し、どの feature のどのレイヤーかを一目で判別できるようにする
- **対象**: `{featureRoot}/**/*.ts`
- **NG 例**:

```ts
import * as svc from "../comics/services/server.service"; // 略称
```

```ts
import * as repo from "../users/repositories/server.repo"; // レイヤー名のみ
```

```ts
import * as s from "../comics/services/client.service"; // 不明瞭な名前
```

- **OK 例**:

```ts
import * as comicsServerService from "../comics/services/server.service";
```

```ts
import * as usersServerRepo from "../users/repositories/server.repo";
```

```ts
import * as comicsClientService from "../comics/services/client.service";
```

#### actions の export 関数名（`no-restricted-syntax`）

- **説明**: actions ファイルから export する関数は `handleXxx` 形式に統一する。エントリポイントの役割を明確にする
- **対象**: `{featureRoot}/**/actions/*.ts`
- **NG 例**:

```ts
// actions/server.action.ts
export function getComics() {}
```

```ts
// actions/server.action.ts
export function createUser() {}
```

```ts
// actions/server.action.ts
export function deletePayment() {}
```

- **OK 例**:

```ts
// actions/server.action.ts
export function handleGetComics() {}
```

```ts
// actions/server.action.ts
export function handleCreateUser() {}
```

```ts
// actions/server.action.ts
export function handleDeletePayment() {}
```

#### actions と services の対応（`local/action-handle-service`）

- **説明**: `handleXxx` は対応するサービスメソッド `*.xxx()` を呼び出す必要がある。action と service の対応関係を強制する
- **対象**: `{featureRoot}/**/actions/*.ts`
- **NG 例**:

```ts
// actions/server.action.ts
export function handleGetComics() {
  return db.query(); // service メソッドを呼んでいない
}
```

```ts
// actions/server.action.ts
export function handleCreateUser() {
  return repo.insert(data); // repo を直接呼んでいる
}
```

```ts
// actions/server.action.ts
export function handleDeletePayment() {
  return fetch("/api/delete"); // 外部 API を直接呼んでいる
}
```

- **OK 例**:

```ts
// actions/server.action.ts
export function handleGetComics() {
  return serverService.getComics();
}
```

```ts
// actions/server.action.ts
export function handleCreateUser() {
  return serverService.createUser(data);
}
```

```ts
// actions/server.action.ts
export function handleDeletePayment() {
  return serverService.deletePayment(id);
}
```

#### features 内 .tsx 禁止（`no-restricted-syntax`）

- **説明**: features ディレクトリは純粋なロジック層。コンポーネントは `src/components/` に配置する
- **対象**: `{featureRoot}/**/*.tsx`
- **NG 例**: `src/features/comics/ComicList.tsx`, `src/features/users/UserCard.tsx`, `src/features/payments/PaymentForm.tsx`
- **OK 例**: `src/components/comics/ComicList.tsx`, `src/components/users/UserCard.tsx`, `src/components/payments/PaymentForm.tsx`

---

### レイヤー制約（layers.mjs）

#### logger/console の使用制限

- **説明**: ログ出力は actions に集約する。他レイヤーでは `console` も `logger` も禁止（error）
- **対象**: `{featureRoot}/**/*.ts`（actions を除く）
- **NG 例**:

```ts
// services/server.service.ts
console.log("debug");
```

```ts
// repositories/server.repo.ts
logger.info("query executed");
```

```ts
// utils/format.util.ts
console.error("format failed");
```

- **OK 例**:

```ts
// actions/server.action.ts
logger.info("handleGetComics called");
```

```ts
// actions/server.action.ts
logger.error("unexpected error", error);
```

```ts
// actions/client.action.ts
logger.warn("retrying request");
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
  return null; // エラーハンドリングは actions の責務
}
```

```ts
// repositories/server.repo.ts
if (isAdmin) {
  return await db.adminQuery(); // 条件分岐は services の責務
}
```

```ts
// repositories/server.repo.ts
try {
  return await db.insert(data);
} catch (e) {
  throw new CustomError("insert failed"); // ラップも禁止
}
```

- **OK 例**:

```ts
// repositories/server.repo.ts
export function getComics() {
  return db.query();
}
```

```ts
// repositories/server.repo.ts
export function createComic(data: ComicInput) {
  return db.insert(data);
}
```

```ts
// repositories/server.repo.ts
export function deleteComic(id: string) {
  return db.delete(id);
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
  return []; // エラーハンドリングは actions の責務
}
```

```ts
// services/server.service.ts
try {
  return repo.createUser(data);
} catch (e) {
  throw new AppError("creation failed"); // ラップも禁止
}
```

```ts
// services/server.service.ts
try {
  const result = repo.deletePayment(id);
  return result;
} catch {
  return null; // フォールバックも禁止
}
```

- **OK 例**:

```ts
// services/server.service.ts
export function getComics() {
  return repo.getComics();
}
```

```ts
// services/server.service.ts
export function getPublishedComics() {
  const comics = repo.getComics();
  return comics.filter((c) => c.published);
}
```

```ts
// services/server.service.ts
export function createUser(data: UserInput) {
  return repo.createUser(data);
}
```

---

### インポート制約（imports.mjs）

#### レイヤー間の import 方向制限

- **説明**: レイヤーの依存方向を `repositories → services → actions` に強制し、循環依存を防ぐ
- **対象**: 各レイヤーのファイル

| レイヤー     | import 不可              |
| ------------ | ------------------------ |
| repositories | services, actions, hooks |
| services     | actions, hooks           |
| actions      | hooks                    |

- **NG 例**:

```ts
// repositories/server.repo.ts
import { getComics } from "../services/server.service"; // repo → service 違反
```

```ts
// services/server.service.ts
import { handleGetComics } from "../actions/server.action"; // service → action 違反
```

```ts
// repositories/server.repo.ts
import { handleGetComics } from "../actions/server.action"; // repo → action 違反
```

- **OK 例**:

```ts
// services/server.service.ts
import * as serverRepo from "../repositories/server.repo"; // service → repo OK
```

```ts
// actions/server.action.ts
import * as serverService from "../services/server.service"; // action → service OK
```

```ts
// actions/server.action.ts
import type { Comic } from "../types/comic.type"; // action → type OK
```

#### 横断的（lateral）import の禁止

- **説明**: 同じレイヤー同士で異なる feature の import を禁止する。feature 間の結合を防ぐ
- **対象**: repositories, services, actions
- **NG 例**:

```ts
// features/comics/services/server.service.ts
import { getUser } from "@/features/users/services/server.service"; // lateral 違反
```

```ts
// features/users/repositories/server.repo.ts
import { getComics } from "@/features/comics/repositories/server.repo"; // lateral 違反
```

```ts
// features/comics/actions/server.action.ts
import { handleCreateUser } from "@/features/users/actions/server.action"; // lateral 違反
```

- **OK 例**:

```ts
// features/comics/services/server.service.ts
import * as serverRepo from "../repositories/server.repo"; // 同一 feature 内
```

```ts
// features/comics/actions/server.action.ts
import * as sharedService from "@/features/shared/services/shared.service"; // shared 経由
```

```ts
// features/comics/actions/server.action.ts
import * as comicsServerService from "../services/server.service"; // 同一 feature、異なるレイヤー
```

#### cardinality 制約

- **説明**: `server.action` は `server.service` のみ、`client.action` は `client.service` のみを import できる。prefix の対応を強制する
- **対象**: `{featureRoot}/**/actions/{server,client,admin}.action.ts`
- **NG 例**:

```ts
// actions/server.action.ts
import * as clientService from "../services/client.service"; // server ↔ client 不一致
```

```ts
// actions/client.action.ts
import * as serverService from "../services/server.service"; // client ↔ server 不一致
```

```ts
// actions/admin.action.ts
import * as clientService from "../services/client.service"; // admin ↔ client 不一致
```

- **OK 例**:

```ts
// actions/server.action.ts
import * as serverService from "../services/server.service";
```

```ts
// actions/client.action.ts
import * as clientService from "../services/client.service";
```

```ts
// actions/admin.action.ts
import * as adminService from "../services/admin.service";
```

#### lib-boundary 制約

- **説明**: `@/lib/*` は repositories と types からのみ import 可能。ライブラリの直接利用をリポジトリ層に閉じ込める
- **対象**: `src/**/*.{ts,tsx}`（lib 自身、repositories、types を除く）
- **NG 例**:

```ts
// services/server.service.ts
import { supabase } from "@/lib/supabase/server"; // service → lib 違反
```

```ts
// actions/server.action.ts
import { stripe } from "@/lib/stripe"; // action → lib 違反
```

```ts
// utils/format.util.ts
import { redis } from "@/lib/redis"; // util → lib 違反
```

- **OK 例**:

```ts
// repositories/server.repo.ts
import { supabase } from "@/lib/supabase/server";
```

```ts
// repositories/server.repo.ts
import { stripe } from "@/lib/stripe";
```

```ts
// types/payment.type.ts
import type { Stripe } from "@/lib/stripe";
```

#### prefix-lib 制約

- **説明**: `{prefix}.repo.ts` は対応する lib のみを import できる。例えば `server.repo.ts` は `lib/supabase/server` のみ
- **対象**: `{featureRoot}/**/repositories/{prefix}.repo.ts`
- **NG 例**:

```ts
// repositories/server.repo.ts
import { supabase } from "@/lib/supabase/client"; // server.repo → client lib 不一致
```

```ts
// repositories/client.repo.ts
import { supabase } from "@/lib/supabase/server"; // client.repo → server lib 不一致
```

```ts
// repositories/admin.repo.ts
import { supabase } from "@/lib/supabase/client"; // admin.repo → client lib 不一致
```

- **OK 例**:

```ts
// repositories/server.repo.ts
import { supabase } from "@/lib/supabase/server";
```

```ts
// repositories/client.repo.ts
import { supabase } from "@/lib/supabase/client";
```

```ts
// repositories/admin.repo.ts
import { supabase } from "@/lib/supabase/admin";
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

```ts
// features/comics/services/server.service.ts
import type { Comic } from "@/features/comics/types/comic.type"; // 同一 feature なのにエイリアス
```

- **OK 例**:

```ts
// features/comics/actions/server.action.ts
import { getComics } from "../services/server.service"; // 同一 feature → 相対パス
```

```ts
// features/comics/actions/server.action.ts
import { getUser } from "@/features/users/services/server.service"; // 別 feature → エイリアス
```

```ts
// features/comics/services/server.service.ts
import type { Comic } from "../types/comic.type"; // 同一 feature → 相対パス
```

---

### JSDoc（jsdoc.mjs）

#### `jsdoc/require-jsdoc` / `jsdoc/require-description`

- **説明**: public な関数には JSDoc と説明を必須にする。repositories, services, utils のインターフェースを明確にする
- **対象**: `{featureRoot}/**/repositories/*.ts`, `**/services*/*.ts`, `**/utils*/*.ts`
- **NG 例**:

```ts
// repositories/server.repo.ts
export function getComics() {
  return db.query();
}
```

```ts
// services/server.service.ts
export function getPublishedComics() {
  return repo.getComics().filter((c) => c.published);
}
```

```ts
// utils/format.util.ts
export function formatDate(date: Date) {
  return date.toISOString();
}
```

- **OK 例**:

```ts
// repositories/server.repo.ts
/** Fetch all comics from the database. */
export function getComics() {
  return db.query();
}
```

```ts
// services/server.service.ts
/** Return only published comics. */
export function getPublishedComics() {
  return repo.getComics().filter((c) => c.published);
}
```

```ts
// utils/format.util.ts
/** Format a Date object to ISO 8601 string. */
export function formatDate(date: Date) {
  return date.toISOString();
}
```

---

## Next.js 固有ルール

`@yasainet/eslint/next` で追加適用される。featureRoot は `src/features`。

### hooks 命名（`check-file/filename-naming-convention` / `no-restricted-syntax`）

- **説明**: hooks ファイルは `useXxx.ts` 形式、export する関数は `useXxx` 形式に統一する
- **対象**: `src/features/**/hooks/*.ts`
- **NG 例**: `fetchData.ts`, `export function getData() {}`, `comicsLoader.ts`
- **OK 例**: `useAuth.ts`, `export function useComics() {}`, `usePayment.ts`

### components: PascalCase / .tsx 限定

- **説明**: コンポーネントファイルは PascalCase かつ `.tsx` 限定。ロジックは features に分離する
- **対象**: `src/components/**/*.tsx`（shared/ui を除く）、`src/components/**/*.ts`
- **NG 例**: `button.tsx`, `comic-list.tsx`, `Helper.ts`
- **OK 例**: `Button.tsx`, `ComicList.tsx`, `PaymentForm.tsx`

### directives（`no-restricted-syntax`）

- **説明**: Server Actions / Client Components のディレクティブを強制する

| ファイル           | 必要なディレクティブ |
| ------------------ | -------------------- |
| `server.action.ts` | `"use server"` 必須  |
| `admin.action.ts`  | `"use server"` 必須  |
| `client.action.ts` | `"use server"` 禁止  |
| `hooks/*.ts`       | `"use client"` 必須  |

- **NG 例**:

```ts
// actions/server.action.ts
import * as serverService from "..."; // "use server" がない
```

```ts
// actions/client.action.ts
"use server"; // client.action に "use server" は禁止
import * as clientService from "...";
```

```ts
// hooks/useAuth.ts
import { useState } from "react"; // "use client" がない
```

- **OK 例**:

```ts
// actions/server.action.ts
"use server";
import * as serverService from "...";
```

```ts
// actions/client.action.ts
import * as clientService from "..."; // "use server" なし — 正しい
```

```ts
// hooks/useAuth.ts
"use client";
import { useState } from "react";
```

### import パススタイル（`local/import-path-style`）

- **説明**: 同一 feature 内は相対パス、feature 間は `@/` エイリアス。[インポート制約](#-エイリアス-vs-相対パスの使い分けlocalimport-path-style)を参照
- **対象**: `src/features/**/*.ts`
- **NG 例**:

```ts
// features/comics/actions/server.action.ts
import * as serverService from "@/features/comics/services/server.service"; // 同一 feature なのにエイリアス
```

```ts
// features/comics/services/server.service.ts
import { getUser } from "../../users/services/server.service"; // 別 feature なのに相対パス
```

```ts
// features/users/hooks/useUser.ts
import type { User } from "@/features/users/types/user.type"; // 同一 feature なのにエイリアス
```

- **OK 例**:

```ts
// features/comics/actions/server.action.ts
import * as serverService from "../services/server.service";
```

```ts
// features/comics/services/server.service.ts
import { getUser } from "@/features/users/services/server.service";
```

```ts
// features/users/hooks/useUser.ts
import type { User } from "../types/user.type";
```

---

## Node.js 固有ルール

`@yasainet/eslint/node` で適用。featureRoot は `scripts/features`。

### `@/` エイリアス禁止

- **説明**: Node.js 環境では `@/` エイリアスが使えないため、相対パスを強制する
- **対象**: `scripts/features/**/*.ts`
- **NG 例**:

```ts
// scripts/features/comics/services/server.service.ts
import { getUser } from "@/features/users/services/server.service";
```

```ts
// scripts/features/comics/actions/server.action.ts
import type { Comic } from "@/features/comics/types/comic.type";
```

```ts
// scripts/features/users/repositories/server.repo.ts
import { db } from "@/lib/database";
```

- **OK 例**:

```ts
// scripts/features/comics/services/server.service.ts
import { getUser } from "../../users/services/server.service";
```

```ts
// scripts/features/comics/actions/server.action.ts
import type { Comic } from "../types/comic.type";
```

```ts
// scripts/features/users/repositories/server.repo.ts
import { db } from "../../../lib/database";
```

---

## Deno 固有ルール

`@yasainet/eslint/deno` で適用。featureRoot は `supabase/functions/_features`。

### `@/` エイリアス禁止

- **説明**: Deno 環境では `@/` エイリアスが使えないため、相対パスを強制する
- **対象**: `supabase/functions/_features/**/*.ts`
- **NG 例**:

```ts
// _features/comics/services/comics.service.ts
import { getUser } from "@/features/users/services/users.service";
```

```ts
// _features/comics/actions/comics.action.ts
import type { Comic } from "@/features/comics/types/comic.type";
```

```ts
// _features/users/repositories/users.repo.ts
import { supabase } from "@/lib/supabase";
```

- **OK 例**:

```ts
// _features/comics/services/comics.service.ts
import { getUser } from "../../users/services/users.service";
```

```ts
// _features/comics/actions/comics.action.ts
import type { Comic } from "../types/comic.type";
```

```ts
// _features/users/repositories/users.repo.ts
import { supabase } from "../../_lib/supabase";
```

### `_lib/` の boundary 制約

- **説明**: `_lib/` は repositories と types からのみ import 可能。Next.js の `@/lib` 制約と同等
- **対象**: `supabase/functions/**/*.ts`（`_lib/` 自身、repositories、types を除く）
- **NG 例**:

```ts
// _features/comics/services/comics.service.ts
import { supabase } from "../../_lib/supabase"; // service → _lib 違反
```

```ts
// _features/comics/actions/comics.action.ts
import { redis } from "../../_lib/redis"; // action → _lib 違反
```

```ts
// _features/comics/utils/format.util.ts
import { supabase } from "../../_lib/supabase"; // util → _lib 違反
```

- **OK 例**:

```ts
// _features/comics/repositories/comics.repo.ts
import { supabase } from "../../_lib/supabase";
```

```ts
// _features/comics/repositories/comics.repo.ts
import { redis } from "../../_lib/redis";
```

```ts
// _features/comics/types/comic.type.ts
import type { Database } from "../../_lib/supabase";
```

### エントリポイント制約

- **説明**: Edge Function エントリポイント（`_` プレフィックスなしのディレクトリ）は actions と `_utils/` のみを import できる。services、repositories、`_lib/` の直接 import を禁止し、actions をエントリポイントとする
- **対象**: `supabase/functions/**/*.ts`（`_features/`, `_lib/`, `_utils/` を除く）
- **NG 例**:

```ts
// execute-jobs/index.ts
import { getComics } from "../_features/comics/services/comics.service"; // service の直接 import 違反
```

```ts
// execute-jobs/index.ts
import { getComics } from "../_features/comics/repositories/comics.repo"; // repo の直接 import 違反
```

```ts
// execute-jobs/index.ts
import { supabase } from "../_lib/supabase"; // _lib の直接 import 違反
```

- **OK 例**:

```ts
// execute-jobs/index.ts
import { handleSyncComics } from "../_features/comics/actions/comics.action";
```

```ts
// execute-jobs/index.ts
import { createResponse } from "../_utils/http/response.util.ts";
```

```ts
// execute-jobs/index.ts
import { handleGetUsers } from "../_features/users/actions/users.action";
```

### `_utils/` の boundary 制約

- **説明**: `_utils/` は `_features/` と `_lib/` を import できない。汎用ユーティリティとしての独立性を保つ
- **対象**: `supabase/functions/_utils/**/*.ts`
- **NG 例**:

```ts
// _utils/http/response.util.ts
import { supabase } from "../_lib/supabase"; // _utils → _lib 違反
```

```ts
// _utils/http/response.util.ts
import { getComics } from "../_features/comics/services/comics.service"; // _utils → _features 違反
```

```ts
// _utils/validation/schema.util.ts
import type { Comic } from "../_features/comics/types/comic.type"; // _utils → _features 違反（型も不可）
```

- **OK 例**:

```ts
// _utils/http/response.util.ts
import { Status } from "jsr:@std/http/status";
```

```ts
// _utils/validation/schema.util.ts
import { z } from "npm:zod";
```

```ts
// _utils/date/format.util.ts
import { format } from "npm:date-fns";
```
