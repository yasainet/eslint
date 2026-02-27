# Directives

React Server Components (RSC) のディレクティブを正しく配置することを強制する。
サーバー/クライアントの境界を明示し、意図しないバンドル混入を防ぐ。

## ルール

| ファイル | ディレクティブ | 理由 |
| --- | --- | --- |
| `server.action.ts` | `"use server"` 必須 | Server Actions として機能するため |
| `admin.action.ts` | `"use server"` 必須 | Server Actions として機能するため |
| `client.action.ts` | `"use server"` 禁止 | `@/lib/supabase/client` を使用するクライアント側コード |
| `hooks/*.ts` | `"use client"` 必須 | React Hooks はクライアントコンポーネントでのみ動作する |

### RSC との関係

Next.js の App Router では、デフォルトですべてのコンポーネントが Server Components として扱われる。

- `"use server"` — ファイル内の関数をサーバー上でのみ実行可能にする（Server Actions）
- `"use client"` — ファイルをクライアントバンドルに含める（Client Components / Hooks）

ディレクティブの有無でバンドル境界が決まるため、誤配置はセキュリティリスクやランタイムエラーの原因になる。

## 対象ファイル

- `src/features/**/actions/server.action.ts`
- `src/features/**/actions/admin.action.ts`
- `src/features/**/actions/client.action.ts`
- `src/features/**/hooks/*.ts`

## エラー例・OK 例

### server.action.ts

```ts
// NG: ディレクティブがない
import { getUser } from "../domain/server.domain";
// error: server.action.ts must start with "use server" directive.

export async function handleGetUser() { ... }

// OK
"use server";

import { getUser } from "../domain/server.domain";

export async function handleGetUser() { ... }
```

### client.action.ts

```ts
// NG: use server が付いている
"use server";
// error: client.action.ts must NOT have "use server" directive.
//        It uses @/lib/supabase/client.

import { getUser } from "../domain/client.domain";

export async function handleGetUser() { ... }

// OK: ディレクティブなし
import { getUser } from "../domain/client.domain";

export async function handleGetUser() { ... }
```

### hooks

```ts
// NG: use client がない
import { useState } from "react";
// error: Hooks must start with "use client" directive.

export function useAuth() { ... }

// OK
"use client";

import { useState } from "react";

export function useAuth() { ... }
```
