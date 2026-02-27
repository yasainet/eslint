# Imports

すべての `no-restricted-imports` ルールを一箇所に統合し、レイヤー間・フィーチャー間・ライブラリ境界のインポート制限を強制する。
ESLint flat config の「後勝ち」問題を回避するために、パターンを単一のモジュールにまとめている。

## ルール

5 つのパターンカテゴリでインポートを制限する。

### 1. Layer（レイヤー制限）

下位レイヤーから上位レイヤーへのインポートを禁止する。

```text
hooks → actions → domain → repositories
```

| ファイルのレイヤー | インポート禁止 |
| --- | --- |
| repositories | `*/domain/*`, `*/actions/*`, `*/hooks/*` |
| domain | `*/actions/*`, `*/hooks/*` |
| actions | `*/hooks/*` |

### 2. Cross-feature（クロスフィーチャー制限）

同一レイヤーの別フィーチャーからのインポートを禁止する。

| ファイルのレイヤー | インポート禁止 |
| --- | --- |
| repositories | `@/features/*/repositories/*` |
| domain | `@/features/*/domain/*` |
| actions | `@/features/*/actions/*` |

フィーチャー間で共有が必要なロジックは `shared/` に配置する。

### 3. Cardinality（カーディナリティ制限）

action から domain へのインポートを 1:1 のプレフィックスマッチに制限する。

| action ファイル | インポート可能な domain | インポート禁止 |
| --- | --- | --- |
| `server.action.ts` | `server.domain.ts` | `client.domain.*`, `admin.domain.*` |
| `client.action.ts` | `client.domain.ts` | `server.domain.*`, `admin.domain.*` |
| `admin.action.ts` | `admin.domain.ts` | `server.domain.*`, `client.domain.*` |

### 4. Prefix-lib（プレフィックス-ライブラリ制限）

各リポジトリファイルが対応する `@/lib` モジュールのみをインポートできるように制限する。

| repo ファイル | インポート可能 | インポート禁止 |
| --- | --- | --- |
| `server.repo.ts` | `@/lib/supabase/server` | `@/lib/supabase/client`, `@/lib/supabase/admin` 等 |
| `client.repo.ts` | `@/lib/supabase/client` | `@/lib/supabase/server`, `@/lib/supabase/admin` 等 |
| `stripe.repo.ts` | `@/lib/stripe` | `@/lib/supabase/*` 等 |

マッピングは `src/lib/` のスキャンにより動的に生成される（[naming.md](naming.md) の「プレフィックスの動的生成」を参照）。

### 5. Lib-boundary（ライブラリ境界制限）

`@/lib/*` は repositories からのみインポート可能。それ以外のレイヤーからの直接インポートを禁止する。

| ファイル | `@/lib/*` のインポート |
| --- | --- |
| `**/repositories/*.ts` | 許可 |
| `**/domain/*.ts` | 禁止 |
| `**/actions/*.ts` | 禁止 |
| `**/hooks/*.ts` | 禁止 |
| `src/components/**` | 禁止 |

例外: `src/lib/**` 内部の相互参照と `src/proxy.ts`, `src/app/sitemap.ts` は許可。

## 対象ファイル

| config 名 | 対象 |
| --- | --- |
| `imports/lib-boundary` | `src/**/*.{ts,tsx}`（`src/lib/**` 等を除く） |
| `imports/repositories` | `**/repositories/*.ts` |
| `imports/repositories/{prefix}` | `**/repositories/{prefix}.repo.ts` |
| `imports/domain` | `**/domain/*.ts` |
| `imports/actions` | `**/actions/*.ts` |
| `imports/actions/{prefix}` | `**/actions/{prefix}.action.ts` |

## エラー例・OK 例

### Layer

```ts
// NG: repositories から domain をインポート
// 📁 src/features/threads/repositories/server.repo.ts
import { validate } from "../domain/server.domain";
// error: repositories cannot import domain (layer violation)

// OK: actions から domain をインポート
// 📁 src/features/threads/actions/server.action.ts
import { validate } from "../domain/server.domain";
```

### Cross-feature

```ts
// NG: 別フィーチャーの actions をインポート
// 📁 src/features/threads/actions/server.action.ts
import { handleGetUser } from "@/features/users/actions/server.action";
// error: actions cannot import other feature's actions (cross-feature violation)
```

### Cardinality

```ts
// NG: server.action から client.domain をインポート
// 📁 src/features/threads/actions/server.action.ts
import { validate } from "../domain/client.domain";
// error: server.action can only import server.domain (cardinality violation)

// OK: server.action から server.domain をインポート
import { validate } from "../domain/server.domain";
```

### Prefix-lib

```ts
// NG: server.repo から client の lib をインポート
// 📁 src/features/threads/repositories/server.repo.ts
import { supabase } from "@/lib/supabase/client";
// error: server.repo.ts can only import from @/lib/supabase/server.

// OK: 対応する lib をインポート
import { supabase } from "@/lib/supabase/server";
```

### Lib-boundary

```ts
// NG: domain から直接 lib をインポート
// 📁 src/features/threads/domain/server.domain.ts
import { supabase } from "@/lib/supabase/server";
// error: @/lib/* can only be imported from repositories (lib-boundary violation)

// OK: repositories 経由でアクセス
// 📁 src/features/threads/repositories/server.repo.ts
import { supabase } from "@/lib/supabase/server";
```
