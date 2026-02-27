# Naming

ファイル名から「そのファイルが何をするか」を即座に判断できるようにする。
ディレクトリごとに命名規則を強制し、プレフィックスでどの外部ライブラリと結びつくかを表現する。

## ルール

### features/ 内の命名規則

| ディレクトリ       | パターン                 | 例                  |
| ------------------ | ------------------------ | ------------------- |
| `services/`        | `{prefix}.service.ts`    | `server.service.ts` |
| `repositories/`    | `{prefix}.repo.ts`       | `server.repo.ts`    |
| `actions/`         | `{prefix}.action.ts`     | `server.action.ts`  |
| `hooks/`           | `use{Name}.ts`           | `useAuth.ts`        |
| `types/`           | `{feature-name}.type.ts` | `users.type.ts`     |
| `types/`（shared） | `{name}.type.ts`         | `users.type.ts`     |
| `schemas/`         | `{name}.schema.ts`       | `users.schema.ts`   |
| `utils/`            | `{feature-name}.utils.ts` | `users.utils.ts`     |
| `utils/`（shared）  | `{name}.utils.ts`         | `format.utils.ts`    |
| `constants/`       | `{name}.constant.ts`     | `users.constant.ts` |

- `{prefix}` は `PREFIX_LIB_MAPPING` のキー（後述）
- `{feature-name}` は親フィーチャーディレクトリ名と一致する必要がある
- `{name}` はケバブケース（`+([a-z0-9-])`）

### プレフィックスの動的生成

`prefix` は消費プロジェクトの `src/lib/` ディレクトリを lint 時にスキャンして自動生成される。

```text
src/lib/
  supabase/
    server.ts  → prefix: "server", lib: "@/lib/supabase/server"
    client.ts  → prefix: "client", lib: "@/lib/supabase/client"
    admin.ts   → prefix: "admin",  lib: "@/lib/supabase/admin"
  stripe.ts    → prefix: "stripe", lib: "@/lib/stripe"
```

生成された `PREFIX_LIB_MAPPING` は以下のルールで使用される:

- **naming** — 有効なファイル名プレフィックスの決定
- **imports** — リポジトリファイルのインポート制限

### 拡張子の制約

| ディレクトリ    | 許可される拡張子 | 理由                                          |
| --------------- | ---------------- | --------------------------------------------- |
| `features/**`   | `.ts` のみ       | コンポーネントは `src/components/` に配置する |
| `components/**` | `.tsx` のみ      | ロジックは `src/features/` に配置する         |

### コンポーネントの命名

- `src/components/**/*.tsx` — PascalCase（例: `Button.tsx`, `AlertDialog.tsx`）
- `src/components/shared/ui/**` — 除外（shadcn/ui はケバブケースを使用）

## 対象ファイル

`FEATURE_ROOTS` 配下のすべてのファイル:

- `src/features/**`
- `scripts/features/**`
- `supabase/functions/features/**`

コンポーネント命名は `src/components/**` に適用。

## エラー例・OK 例

### services/

```text
# NG
src/features/threads/services/logic.ts
src/features/threads/services/threads.ts

# OK
src/features/threads/services/server.service.ts
src/features/threads/services/client.service.ts
```

### hooks/

```text
# NG
src/features/threads/hooks/auth.ts
src/features/threads/hooks/useauth.ts

# OK
src/features/threads/hooks/useAuth.ts
src/features/threads/hooks/useThreadList.ts
```

### 拡張子の制約

```text
# NG: features 内に .tsx
src/features/threads/components/ThreadCard.tsx
  → "features/ must only contain .ts files. Components belong in src/components/."

# NG: components 内に .ts
src/components/utils.ts
  → "components/ must only contain .tsx files. Logic belongs in src/features/."
```
