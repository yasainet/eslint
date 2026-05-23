# Rules Catalog

> [!NOTE]
> このファイルは `scripts/generate-rules-catalog.mjs` により自動生成。
> 手動編集禁止。再生成は `npm run docs`。

## next (`src/next/index.mjs`)

### rules/ignore-shadcn-ui

- Location: src/next/index.mjs (inline)
- Target: ignores: `src/components/shared/ui/*.{ts,tsx}`
- Enforces: (none)

### rules/shared

- Location: src/common/base/typescript.mjs
- Target: (global)
- Enforces:
  - console 呼び出しを禁止
  - 不正な空白文字を禁止
  - import 文の整列を強制
  - export 文の整列を強制
  - 引用符スタイルを統一
  - 到達不能コードを禁止
  - 到達不能ループを禁止
  - 無意味な return を禁止
  - 定数条件を禁止
  - 定数の二項演算を禁止
  - else-if の重複条件を禁止
  - 自己代入を禁止
  - 自己比較を禁止
  - 無意味な catch を禁止
  - switch の fall-through を禁止

### rules/typescript

- Location: src/common/base/typescript.mjs
- Target: files: `**/*.ts`, `**/*.tsx`
- Enforces:
  - 未使用変数を禁止
  - type import を強制
  - any 型の明示使用を禁止
  - 不要な条件式を禁止
  - 浮いた Promise (await 漏れ) を禁止
  - 誤った文脈での Promise 利用を禁止
  - await の対象が thenable であることを強制
  - async 関数に await を必須化
  - any からの代入を禁止
  - any 値の関数呼び出しを禁止
  - any 値へのメンバアクセスを禁止
  - any 引数の受け渡しを禁止
  - any 値の return を禁止

### naming/feature-name

- Location: src/common/cross-cutting/feature-name.mjs
- Target: files: `src/features/**/*.ts`
- Enforces:
  - `local/feature-name` (local plugin)

### naming/namespace-import-name

- Location: src/common/cross-cutting/namespace-import.mjs
- Target: files: `src/features/**/*.ts`
- Enforces:
  - `local/namespace-import-name` (local plugin)

### naming/queries-namespace-import

- Location: src/common/cross-cutting/namespace-import.mjs
- Target: files: `src/features/**/*.ts`
- Enforces:
  - `local/queries-namespace-import` (local plugin)

### naming/services

- Location: src/common/layers/services.mjs
- Target: files: `src/features/**/services/*.ts` / ignores: `src/features/shared/services/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/services-shared

- Location: src/common/layers/services.mjs
- Target: files: `src/features/shared/services/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### layers/services

- Location: src/common/layers/services.mjs
- Target: files: `src/features/**/services/*.ts`
- Enforces:
  - try-catch is not allowed in services. Error handling belongs in entries.
  - throw is not allowed in services. Communicate failures via T | null / { data, error } / empty default. Native exceptions from libs auto-propagate to entry's catch.
  - logger is not allowed outside entries. Logging belongs in entries.
  - Dead fallback for error message. If you reached this branch the error is known — return the error directly. Unhandled exceptions belong in entries.
  - Dead fallback for nullable error. Check `if (error)` and return the error directly. Unhandled exceptions belong in entries.
  - Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.

### imports/services

- Location: src/common/layers/services.mjs
- Target: files: `src/features/**/services/*.ts`
- Enforces:
  - services cannot import entries (layer violation)
  - services cannot import hooks (layer violation)
  - services cannot import other feature's services (lateral violation)
  - lib/* can only be imported from queries (lib-boundary violation)

### naming/queries

- Location: src/common/layers/queries.mjs
- Target: files: `src/features/**/queries/*.ts` / ignores: `src/features/shared/queries/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/queries-shared

- Location: src/common/layers/queries.mjs
- Target: files: `src/features/shared/queries/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/queries-export

- Location: src/common/layers/queries.mjs
- Target: files: `src/features/**/queries/*.ts`
- Enforces:
  - `local/queries-export` (local plugin)

### naming/supabase-select

- Location: src/common/layers/queries.mjs
- Target: files: `src/features/**/queries/*.ts`
- Enforces:
  - `local/supabase-select-typed-columns` (local plugin)

### layers/queries

- Location: src/common/layers/queries.mjs
- Target: files: `src/features/**/queries/*.ts`
- Enforces:
  - try-catch is not allowed in queries. Error handling belongs in entries.
  - if statements are not allowed in queries. Conditional logic belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - throw is not allowed in queries. Queries must return Supabase's { data, error } shape as-is. Error handling belongs in entries.
  - logger is not allowed outside entries. Logging belongs in entries.
  - Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.

### imports/queries

- Location: src/common/layers/queries.mjs
- Target: files: `src/features/**/queries/*.ts`
- Enforces:
  - queries cannot import services (layer violation)
  - queries cannot import entries (layer violation)
  - queries cannot import hooks (layer violation)
  - queries cannot import other feature's queries (lateral violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/form-state

- Location: src/common/cross-cutting/form-state.mjs
- Target: files: `src/features/**/*.ts`
- Enforces:
  - `local/form-state-naming` (local plugin)
  - `local/form-state-shape` (local plugin)

### naming/supabase-columns-satisfies

- Location: src/common/cross-cutting/supabase-columns-satisfies.mjs
- Target: files: `src/features/**/queries/*.ts`, `src/features/**/constants/*.ts`
- Enforces:
  - `local/supabase-columns-satisfies` (local plugin)

### naming/lib

- Location: src/common/layers/lib.mjs
- Target: files: `src/lib/**/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/top-level-utils

- Location: src/common/layers/top-level-utils.mjs
- Target: files: `src/utils/**/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/types

- Location: src/common/layers/types.mjs
- Target: files: `src/features/*/types/*.ts` / ignores: `src/features/shared/types/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/types/*.ts`)

### naming/types-shared

- Location: src/common/layers/types.mjs
- Target: files: `src/features/shared/types/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### imports/feature-types

- Location: src/common/layers/types.mjs
- Target: files: `src/features/**/types/*.ts`
- Enforces:
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/schemas

- Location: src/common/layers/schemas.mjs
- Target: files: `src/features/*/schemas/*.ts` / ignores: `src/features/shared/schemas/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/schemas/*.ts`)

### naming/schemas-shared

- Location: src/common/layers/schemas.mjs
- Target: files: `src/features/shared/schemas/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/schema-naming

- Location: src/common/layers/schemas.mjs
- Target: files: `src/features/**/schemas/*.ts`
- Enforces:
  - `local/schema-naming` (local plugin)

### naming/utils

- Location: src/common/layers/utils.mjs
- Target: files: `src/features/*/utils/*.ts` / ignores: `src/features/shared/utils/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/utils/*.ts`)

### naming/utils-shared

- Location: src/common/layers/utils.mjs
- Target: files: `src/features/shared/utils/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### imports/utils

- Location: src/common/layers/utils.mjs
- Target: files: `src/features/**/utils/*.ts`
- Enforces:
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/constants

- Location: src/common/layers/constants.mjs
- Target: files: `src/features/*/constants/*.ts` / ignores: `src/features/shared/constants/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/constants/*.ts`)

### naming/constants-shared

- Location: src/common/layers/constants.mjs
- Target: files: `src/features/shared/constants/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/entries

- Location: src/common/layers/entries.mjs
- Target: files: `src/features/**/entries/*.ts` / ignores: `src/features/shared/entries/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/entries-shared

- Location: src/common/layers/entries.mjs
- Target: files: `src/features/shared/entries/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/entry-template

- Location: src/common/layers/entries.mjs
- Target: files: `src/features/**/entries/*.ts`
- Enforces:
  - `local/entry-template` (local plugin)

### naming/entry-single-service-call

- Location: src/common/layers/entries.mjs
- Target: files: `src/features/**/entries/*.ts`
- Enforces:
  - `local/entry-single-service-call` (local plugin)

### layers/entries

- Location: src/common/layers/entries.mjs
- Target: files: `src/features/**/entries/*.ts`
- Enforces:
  - Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.

### imports/entries

- Location: src/common/layers/entries.mjs
- Target: files: `src/features/**/entries/*.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/entries/server

- Location: src/common/layers/entries.mjs
- Target: files: `src/features/**/entries/server.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - server entry can only import server service (cardinality violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/entries/client

- Location: src/common/layers/entries.mjs
- Target: files: `src/features/**/entries/client.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - client entry can only import client service (cardinality violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/entries/admin

- Location: src/common/layers/entries.mjs
- Target: files: `src/features/**/entries/admin.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - admin entry can only import admin service (cardinality violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/features-ts-only

- Location: src/common/cross-cutting/features-ts-only.mjs
- Target: files: `src/features/**/*.tsx`
- Enforces:
  - features/ must only contain .ts files. Components belong in src/components/.

### layers/logger

- Location: src/common/cross-cutting/logger.mjs
- Target: files: `src/features/**/*.ts` / ignores: `src/features/**/entries/*.ts`
- Enforces:
  - console 呼び出しを禁止
  - logger is not allowed outside entries. Logging belongs in entries.

### layers/no-any-return

- Location: src/common/cross-cutting/no-any-return.mjs
- Target: files: `src/features/**/queries/*.ts`, `src/features/**/services/*.ts`
- Enforces:
  - `local/no-any-return` (local plugin)

### imports/feature-other

- Location: src/common/cross-cutting/feature-default-imports.mjs
- Target: files: `src/features/**/*.ts` / ignores: `src/features/**/services/*.ts`, `src/features/**/queries/*.ts`, `src/features/**/entries/*.ts`, `src/features/**/utils/*.ts`, `src/features/**/types/*.ts`
- Enforces:
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### jsdoc

- Location: src/common/cross-cutting/jsdoc.mjs
- Target: files: `src/features/**/queries/*.ts`, `src/features/**/services*/*.ts`, `src/features/**/utils*/*.ts`
- Enforces:
  - JSDoc の付与を強制
  - JSDoc に description を必須化

### imports/lib-boundary

- Location: src/next/boundaries/lib.mjs
- Target: files: `src/**/*.{ts,tsx}` / ignores: `src/lib/**`, `src/proxy.ts`, `src/app/**/route.ts`, `src/features/**`
- Enforces:
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/page-boundary

- Location: src/next/boundaries/page.mjs
- Target: files: `src/app/**/page.tsx`
- Enforces:
  - page.tsx can only import entries, not queries (page-boundary violation)
  - page.tsx can only import entries, not services (page-boundary violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/route-boundary

- Location: src/next/boundaries/route.mjs
- Target: files: `src/app/**/route.ts`
- Enforces:
  - route.ts can only import entries, not queries (route-boundary violation)
  - route.ts can only import entries, not services (route-boundary violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/sitemap-boundary

- Location: src/next/boundaries/sitemap.mjs
- Target: files: `src/app/sitemap.ts`, `src/app/**/sitemap.ts`
- Enforces:
  - sitemap.ts can only import entries, not queries (sitemap-boundary violation)
  - sitemap.ts can only import entries, not services (sitemap-boundary violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/hooks-boundary

- Location: src/next/boundaries/hooks.mjs
- Target: files: `src/features/**/hooks/*.ts`
- Enforces:
  - hooks can only import entries, not queries (hooks-boundary violation)
  - hooks can only import entries, not services (hooks-boundary violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/components-boundary

- Location: src/next/boundaries/components.mjs
- Target: files: `src/components/**/*.{ts,tsx}`
- Enforces:
  - components can only import entries or hooks, not queries (components-boundary violation)
  - components can only import entries or hooks, not services (components-boundary violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/hooks

- Location: src/next/layers/hooks.mjs
- Target: files: `src/features/**/hooks/*.ts`
- Enforces:
  - ファイル名を `use-+([a-z0-9])*(-+([a-z0-9]))` に強制 (適用: `**/*.ts`)

### naming/hooks-export

- Location: src/next/layers/hooks.mjs
- Target: files: `src/features/**/hooks/*.ts`
- Enforces:
  - Exported functions in hooks must start with 'use' (e.g., useAuth).

### naming/components-tsx-only

- Location: src/next/layers/components.mjs
- Target: files: `src/components/**/*.ts`
- Enforces:
  - components/ must only contain .tsx files. Logic belongs in src/features/.

### naming/components-pascal-case

- Location: src/next/layers/components.mjs
- Target: files: `src/components/**/*.tsx` / ignores: `src/components/shared/ui/**`, `src/components/**/index.tsx`
- Enforces:
  - ファイル名を `PASCAL_CASE` に強制 (適用: `**/*.tsx`)

### directives/server-entry

- Location: src/next/directives.mjs
- Target: files: `src/features/**/entries/server.ts`
- Enforces:
  - entries/server.ts must start with "use server" directive.

### directives/admin-entry

- Location: src/next/directives.mjs
- Target: files: `src/features/**/entries/admin.ts`
- Enforces:
  - entries/admin.ts must start with "use server" directive.

### directives/client-entry

- Location: src/next/directives.mjs
- Target: files: `src/features/**/entries/client.ts`
- Enforces:
  - entries/client.ts must NOT have "use server" directive. It uses @/lib/supabase/client.

### directives/hooks

- Location: src/next/directives.mjs
- Target: files: `src/features/**/hooks/*.ts`
- Enforces:
  - Hooks must start with "use client" directive.

### imports/path-style

- Location: src/next/imports.mjs
- Target: files: `src/features/**/*.ts`
- Enforces:
  - `local/import-path-style` (local plugin)

### layouts/main-structural-only

- Location: src/next/layers/layouts.mjs
- Target: files: `src/app/**/layout.tsx`
- Enforces:
  - `local/layout-main-structural-only` (local plugin)

### tailwindcss/rules

- Location: src/next/tailwindcss.mjs
- Target: files: `src/**/*.{ts,tsx}`
- Enforces:
  - Tailwind class 順を統一
  - `!important` の位置を統一
  - 競合する Tailwind class を禁止
  - 非推奨 Tailwind class を禁止
  - 重複した Tailwind class を禁止
  - 禁止 Tailwind class を制限
  - 不要な空白を禁止

### entry-points/no-namespace-import

- Location: src/common/boundaries/entry-point.mjs
- Target: files: `src/app/**/*.ts`, `src/app/**/*.tsx`
- Enforces:
  - Entry points must use named imports instead of `import * as`. This makes dependencies explicit.

## node (`src/node/index.mjs`)

### rules/shared

- Location: src/common/base/typescript.mjs
- Target: (global)
- Enforces:
  - console 呼び出しを禁止
  - 不正な空白文字を禁止
  - import 文の整列を強制
  - export 文の整列を強制
  - 引用符スタイルを統一
  - 到達不能コードを禁止
  - 到達不能ループを禁止
  - 無意味な return を禁止
  - 定数条件を禁止
  - 定数の二項演算を禁止
  - else-if の重複条件を禁止
  - 自己代入を禁止
  - 自己比較を禁止
  - 無意味な catch を禁止
  - switch の fall-through を禁止

### rules/typescript

- Location: src/common/base/typescript.mjs
- Target: files: `**/*.ts`, `**/*.tsx`
- Enforces:
  - 未使用変数を禁止
  - type import を強制
  - any 型の明示使用を禁止
  - 不要な条件式を禁止
  - 浮いた Promise (await 漏れ) を禁止
  - 誤った文脈での Promise 利用を禁止
  - await の対象が thenable であることを強制
  - async 関数に await を必須化
  - any からの代入を禁止
  - any 値の関数呼び出しを禁止
  - any 値へのメンバアクセスを禁止
  - any 引数の受け渡しを禁止
  - any 値の return を禁止

### naming/feature-name

- Location: src/common/cross-cutting/feature-name.mjs
- Target: files: `scripts/features/**/*.ts`
- Enforces:
  - `local/feature-name` (local plugin)

### naming/namespace-import-name

- Location: src/common/cross-cutting/namespace-import.mjs
- Target: files: `scripts/features/**/*.ts`
- Enforces:
  - `local/namespace-import-name` (local plugin)

### naming/queries-namespace-import

- Location: src/common/cross-cutting/namespace-import.mjs
- Target: files: `scripts/features/**/*.ts`
- Enforces:
  - `local/queries-namespace-import` (local plugin)

### naming/services

- Location: src/common/layers/services.mjs
- Target: files: `scripts/features/**/services/*.ts` / ignores: `scripts/features/shared/services/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/services-shared

- Location: src/common/layers/services.mjs
- Target: files: `scripts/features/shared/services/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### layers/services

- Location: src/common/layers/services.mjs
- Target: files: `scripts/features/**/services/*.ts`
- Enforces:
  - try-catch is not allowed in services. Error handling belongs in entries.
  - throw is not allowed in services. Communicate failures via T | null / { data, error } / empty default. Native exceptions from libs auto-propagate to entry's catch.
  - logger is not allowed outside entries. Logging belongs in entries.
  - Dead fallback for error message. If you reached this branch the error is known — return the error directly. Unhandled exceptions belong in entries.
  - Dead fallback for nullable error. Check `if (error)` and return the error directly. Unhandled exceptions belong in entries.
  - Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.

### imports/services

- Location: src/common/layers/services.mjs
- Target: files: `scripts/features/**/services/*.ts`
- Enforces:
  - services cannot import entries (layer violation)
  - services cannot import hooks (layer violation)
  - services cannot import other feature's services (lateral violation)
  - lib/* can only be imported from queries (lib-boundary violation)

### naming/queries

- Location: src/common/layers/queries.mjs
- Target: files: `scripts/features/**/queries/*.ts` / ignores: `scripts/features/shared/queries/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/queries-shared

- Location: src/common/layers/queries.mjs
- Target: files: `scripts/features/shared/queries/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/queries-export

- Location: src/common/layers/queries.mjs
- Target: files: `scripts/features/**/queries/*.ts`
- Enforces:
  - `local/queries-export` (local plugin)

### naming/supabase-select

- Location: src/common/layers/queries.mjs
- Target: files: `scripts/features/**/queries/*.ts`
- Enforces:
  - `local/supabase-select-typed-columns` (local plugin)

### layers/queries

- Location: src/common/layers/queries.mjs
- Target: files: `scripts/features/**/queries/*.ts`
- Enforces:
  - try-catch is not allowed in queries. Error handling belongs in entries.
  - if statements are not allowed in queries. Conditional logic belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - throw is not allowed in queries. Queries must return Supabase's { data, error } shape as-is. Error handling belongs in entries.
  - logger is not allowed outside entries. Logging belongs in entries.
  - Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.

### imports/queries

- Location: src/common/layers/queries.mjs
- Target: files: `scripts/features/**/queries/*.ts`
- Enforces:
  - queries cannot import services (layer violation)
  - queries cannot import entries (layer violation)
  - queries cannot import hooks (layer violation)
  - queries cannot import other feature's queries (lateral violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/form-state

- Location: src/common/cross-cutting/form-state.mjs
- Target: files: `scripts/features/**/*.ts`
- Enforces:
  - `local/form-state-naming` (local plugin)
  - `local/form-state-shape` (local plugin)

### naming/supabase-columns-satisfies

- Location: src/common/cross-cutting/supabase-columns-satisfies.mjs
- Target: files: `scripts/features/**/queries/*.ts`, `scripts/features/**/constants/*.ts`
- Enforces:
  - `local/supabase-columns-satisfies` (local plugin)

### naming/lib

- Location: src/common/layers/lib.mjs
- Target: files: `scripts/lib/**/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/top-level-utils

- Location: src/common/layers/top-level-utils.mjs
- Target: files: `scripts/utils/**/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/types

- Location: src/common/layers/types.mjs
- Target: files: `scripts/features/*/types/*.ts` / ignores: `scripts/features/shared/types/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/types/*.ts`)

### naming/types-shared

- Location: src/common/layers/types.mjs
- Target: files: `scripts/features/shared/types/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### imports/feature-types

- Location: src/common/layers/types.mjs
- Target: files: `scripts/features/**/types/*.ts`
- Enforces:
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/schemas

- Location: src/common/layers/schemas.mjs
- Target: files: `scripts/features/*/schemas/*.ts` / ignores: `scripts/features/shared/schemas/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/schemas/*.ts`)

### naming/schemas-shared

- Location: src/common/layers/schemas.mjs
- Target: files: `scripts/features/shared/schemas/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/schema-naming

- Location: src/common/layers/schemas.mjs
- Target: files: `scripts/features/**/schemas/*.ts`
- Enforces:
  - `local/schema-naming` (local plugin)

### naming/utils

- Location: src/common/layers/utils.mjs
- Target: files: `scripts/features/*/utils/*.ts` / ignores: `scripts/features/shared/utils/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/utils/*.ts`)

### naming/utils-shared

- Location: src/common/layers/utils.mjs
- Target: files: `scripts/features/shared/utils/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### imports/utils

- Location: src/common/layers/utils.mjs
- Target: files: `scripts/features/**/utils/*.ts`
- Enforces:
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/constants

- Location: src/common/layers/constants.mjs
- Target: files: `scripts/features/*/constants/*.ts` / ignores: `scripts/features/shared/constants/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/constants/*.ts`)

### naming/constants-shared

- Location: src/common/layers/constants.mjs
- Target: files: `scripts/features/shared/constants/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/entries

- Location: src/common/layers/entries.mjs
- Target: files: `scripts/features/**/entries/*.ts` / ignores: `scripts/features/shared/entries/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/entries-shared

- Location: src/common/layers/entries.mjs
- Target: files: `scripts/features/shared/entries/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/entry-template

- Location: src/common/layers/entries.mjs
- Target: files: `scripts/features/**/entries/*.ts`
- Enforces:
  - `local/entry-template` (local plugin)

### naming/entry-single-service-call

- Location: src/common/layers/entries.mjs
- Target: files: `scripts/features/**/entries/*.ts`
- Enforces:
  - `local/entry-single-service-call` (local plugin)

### layers/entries

- Location: src/common/layers/entries.mjs
- Target: files: `scripts/features/**/entries/*.ts`
- Enforces:
  - Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.

### imports/entries

- Location: src/common/layers/entries.mjs
- Target: files: `scripts/features/**/entries/*.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/entries/server

- Location: src/common/layers/entries.mjs
- Target: files: `scripts/features/**/entries/server.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - server entry can only import server service (cardinality violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/entries/client

- Location: src/common/layers/entries.mjs
- Target: files: `scripts/features/**/entries/client.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - client entry can only import client service (cardinality violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/entries/admin

- Location: src/common/layers/entries.mjs
- Target: files: `scripts/features/**/entries/admin.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - admin entry can only import admin service (cardinality violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/features-ts-only

- Location: src/common/cross-cutting/features-ts-only.mjs
- Target: files: `scripts/features/**/*.tsx`
- Enforces:
  - features/ must only contain .ts files. Components belong in src/components/.

### layers/logger

- Location: src/common/cross-cutting/logger.mjs
- Target: files: `scripts/features/**/*.ts` / ignores: `scripts/features/**/entries/*.ts`
- Enforces:
  - console 呼び出しを禁止
  - logger is not allowed outside entries. Logging belongs in entries.

### layers/no-any-return

- Location: src/common/cross-cutting/no-any-return.mjs
- Target: files: `scripts/features/**/queries/*.ts`, `scripts/features/**/services/*.ts`
- Enforces:
  - `local/no-any-return` (local plugin)

### imports/feature-other

- Location: src/common/cross-cutting/feature-default-imports.mjs
- Target: files: `scripts/features/**/*.ts` / ignores: `scripts/features/**/services/*.ts`, `scripts/features/**/queries/*.ts`, `scripts/features/**/entries/*.ts`, `scripts/features/**/utils/*.ts`, `scripts/features/**/types/*.ts`
- Enforces:
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### jsdoc

- Location: src/common/cross-cutting/jsdoc.mjs
- Target: files: `scripts/features/**/queries/*.ts`, `scripts/features/**/services*/*.ts`, `scripts/features/**/utils*/*.ts`
- Enforces:
  - JSDoc の付与を強制
  - JSDoc に description を必須化

### imports/ban-alias

- Location: src/common/cross-cutting/ban-alias.mjs
- Target: files: `scripts/features/**/*.ts`
- Enforces:
  - Alias imports (@/) are not available in this environment. Use relative paths.

### entry-points/no-namespace-import

- Location: src/common/boundaries/entry-point.mjs
- Target: files: `scripts/commands/*.ts`
- Enforces:
  - Entry points must use named imports instead of `import * as`. This makes dependencies explicit.

## deno (`src/deno/index.mjs`)

### rules/shared

- Location: src/common/base/typescript.mjs
- Target: (global)
- Enforces:
  - console 呼び出しを禁止
  - 不正な空白文字を禁止
  - import 文の整列を強制
  - export 文の整列を強制
  - 引用符スタイルを統一
  - 到達不能コードを禁止
  - 到達不能ループを禁止
  - 無意味な return を禁止
  - 定数条件を禁止
  - 定数の二項演算を禁止
  - else-if の重複条件を禁止
  - 自己代入を禁止
  - 自己比較を禁止
  - 無意味な catch を禁止
  - switch の fall-through を禁止

### rules/typescript

- Location: src/common/base/typescript.mjs
- Target: files: `supabase/functions/**/*.ts`
- Enforces:
  - 未使用変数を禁止
  - type import を強制
  - any 型の明示使用を禁止
  - 不要な条件式を禁止
  - 浮いた Promise (await 漏れ) を禁止
  - 誤った文脈での Promise 利用を禁止
  - await の対象が thenable であることを強制
  - async 関数に await を必須化
  - any からの代入を禁止
  - any 値の関数呼び出しを禁止
  - any 値へのメンバアクセスを禁止
  - any 引数の受け渡しを禁止
  - any 値の return を禁止

### naming/feature-name

- Location: src/common/cross-cutting/feature-name.mjs
- Target: files: `supabase/functions/_features/**/*.ts`
- Enforces:
  - `local/feature-name` (local plugin)

### naming/namespace-import-name

- Location: src/common/cross-cutting/namespace-import.mjs
- Target: files: `supabase/functions/_features/**/*.ts`
- Enforces:
  - `local/namespace-import-name` (local plugin)

### naming/queries-namespace-import

- Location: src/common/cross-cutting/namespace-import.mjs
- Target: files: `supabase/functions/_features/**/*.ts`
- Enforces:
  - `local/queries-namespace-import` (local plugin)

### naming/services

- Location: src/common/layers/services.mjs
- Target: files: `supabase/functions/_features/**/services/*.ts` / ignores: `supabase/functions/_features/shared/services/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/services-shared

- Location: src/common/layers/services.mjs
- Target: files: `supabase/functions/_features/shared/services/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### layers/services

- Location: src/common/layers/services.mjs
- Target: files: `supabase/functions/_features/**/services/*.ts`
- Enforces:
  - try-catch is not allowed in services. Error handling belongs in entries.
  - throw is not allowed in services. Communicate failures via T | null / { data, error } / empty default. Native exceptions from libs auto-propagate to entry's catch.
  - logger is not allowed outside entries. Logging belongs in entries.
  - Dead fallback for error message. If you reached this branch the error is known — return the error directly. Unhandled exceptions belong in entries.
  - Dead fallback for nullable error. Check `if (error)` and return the error directly. Unhandled exceptions belong in entries.
  - Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.

### imports/services

- Location: src/common/layers/services.mjs
- Target: files: `supabase/functions/_features/**/services/*.ts`
- Enforces:
  - services cannot import entries (layer violation)
  - services cannot import hooks (layer violation)
  - services cannot import other feature's services (lateral violation)
  - lib/* can only be imported from queries (lib-boundary violation)

### naming/queries

- Location: src/common/layers/queries.mjs
- Target: files: `supabase/functions/_features/**/queries/*.ts` / ignores: `supabase/functions/_features/shared/queries/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/queries-shared

- Location: src/common/layers/queries.mjs
- Target: files: `supabase/functions/_features/shared/queries/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/queries-export

- Location: src/common/layers/queries.mjs
- Target: files: `supabase/functions/_features/**/queries/*.ts`
- Enforces:
  - `local/queries-export` (local plugin)

### naming/supabase-select

- Location: src/common/layers/queries.mjs
- Target: files: `supabase/functions/_features/**/queries/*.ts`
- Enforces:
  - `local/supabase-select-typed-columns` (local plugin)

### layers/queries

- Location: src/common/layers/queries.mjs
- Target: files: `supabase/functions/_features/**/queries/*.ts`
- Enforces:
  - try-catch is not allowed in queries. Error handling belongs in entries.
  - if statements are not allowed in queries. Conditional logic belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - Loops are not allowed in queries. Queries should be thin CRUD wrappers — iteration belongs in services.
  - throw is not allowed in queries. Queries must return Supabase's { data, error } shape as-is. Error handling belongs in entries.
  - logger is not allowed outside entries. Logging belongs in entries.
  - Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.

### imports/queries

- Location: src/common/layers/queries.mjs
- Target: files: `supabase/functions/_features/**/queries/*.ts`
- Enforces:
  - queries cannot import services (layer violation)
  - queries cannot import entries (layer violation)
  - queries cannot import hooks (layer violation)
  - queries cannot import other feature's queries (lateral violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/form-state

- Location: src/common/cross-cutting/form-state.mjs
- Target: files: `supabase/functions/_features/**/*.ts`
- Enforces:
  - `local/form-state-naming` (local plugin)
  - `local/form-state-shape` (local plugin)

### naming/supabase-columns-satisfies

- Location: src/common/cross-cutting/supabase-columns-satisfies.mjs
- Target: files: `supabase/functions/_features/**/queries/*.ts`, `supabase/functions/_features/**/constants/*.ts`
- Enforces:
  - `local/supabase-columns-satisfies` (local plugin)

### naming/lib

- Location: src/common/layers/lib.mjs
- Target: files: `supabase/functions/_lib/**/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/top-level-utils

- Location: src/common/layers/top-level-utils.mjs
- Target: files: `supabase/functions/_utils/**/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/types

- Location: src/common/layers/types.mjs
- Target: files: `supabase/functions/_features/*/types/*.ts` / ignores: `supabase/functions/_features/shared/types/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/types/*.ts`)

### naming/types-shared

- Location: src/common/layers/types.mjs
- Target: files: `supabase/functions/_features/shared/types/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### imports/feature-types

- Location: src/common/layers/types.mjs
- Target: files: `supabase/functions/_features/**/types/*.ts`
- Enforces:
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/schemas

- Location: src/common/layers/schemas.mjs
- Target: files: `supabase/functions/_features/*/schemas/*.ts` / ignores: `supabase/functions/_features/shared/schemas/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/schemas/*.ts`)

### naming/schemas-shared

- Location: src/common/layers/schemas.mjs
- Target: files: `supabase/functions/_features/shared/schemas/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/schema-naming

- Location: src/common/layers/schemas.mjs
- Target: files: `supabase/functions/_features/**/schemas/*.ts`
- Enforces:
  - `local/schema-naming` (local plugin)

### naming/utils

- Location: src/common/layers/utils.mjs
- Target: files: `supabase/functions/_features/*/utils/*.ts` / ignores: `supabase/functions/_features/shared/utils/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/utils/*.ts`)

### naming/utils-shared

- Location: src/common/layers/utils.mjs
- Target: files: `supabase/functions/_features/shared/utils/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### imports/utils

- Location: src/common/layers/utils.mjs
- Target: files: `supabase/functions/_features/**/utils/*.ts`
- Enforces:
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/constants

- Location: src/common/layers/constants.mjs
- Target: files: `supabase/functions/_features/*/constants/*.ts` / ignores: `supabase/functions/_features/shared/constants/*.ts`
- Enforces:
  - ファイル名を `<1>` に強制 (適用: `**/*/constants/*.ts`)

### naming/constants-shared

- Location: src/common/layers/constants.mjs
- Target: files: `supabase/functions/_features/shared/constants/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/entries

- Location: src/common/layers/entries.mjs
- Target: files: `supabase/functions/_features/**/entries/*.ts` / ignores: `supabase/functions/_features/shared/entries/*.ts`
- Enforces:
  - ファイル名を `*` に強制 (適用: `**/*.ts`)

### naming/entries-shared

- Location: src/common/layers/entries.mjs
- Target: files: `supabase/functions/_features/shared/entries/*.ts`
- Enforces:
  - ファイル名を `shared` に強制 (適用: `**/*.ts`)

### naming/entry-template

- Location: src/common/layers/entries.mjs
- Target: files: `supabase/functions/_features/**/entries/*.ts`
- Enforces:
  - `local/entry-template` (local plugin)

### naming/entry-single-service-call

- Location: src/common/layers/entries.mjs
- Target: files: `supabase/functions/_features/**/entries/*.ts`
- Enforces:
  - `local/entry-single-service-call` (local plugin)

### layers/entries

- Location: src/common/layers/entries.mjs
- Target: files: `supabase/functions/_features/**/entries/*.ts`
- Enforces:
  - Dynamic imports of `@/` aliased paths are not allowed in features layers. They bypass prefix-lib and lateral cardinality (e.g. `await import('@/lib/supabase/admin')` from queries/server.ts escapes the lib-boundary check). Create the correct queries/<prefix>.ts or services/<prefix>.ts file instead. External npm packages can still be lazy-loaded for cold-start optimization.

### imports/entries

- Location: src/common/layers/entries.mjs
- Target: files: `supabase/functions/_features/**/entries/*.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/entries/server

- Location: src/common/layers/entries.mjs
- Target: files: `supabase/functions/_features/**/entries/server.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - server entry can only import server service (cardinality violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/entries/client

- Location: src/common/layers/entries.mjs
- Target: files: `supabase/functions/_features/**/entries/client.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - client entry can only import client service (cardinality violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### imports/entries/admin

- Location: src/common/layers/entries.mjs
- Target: files: `supabase/functions/_features/**/entries/admin.ts`
- Enforces:
  - entries cannot import queries (layer violation)
  - entries cannot import hooks (layer violation)
  - entries cannot import other feature's entries (lateral violation)
  - entries cannot import other feature's services. Use the same feature's service (1:1) or move orchestration into the service layer. `shared/services/*` is exempt for cross-cutting side effects (notifications etc.).
  - admin entry can only import admin service (cardinality violation)
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### naming/features-ts-only

- Location: src/common/cross-cutting/features-ts-only.mjs
- Target: files: `supabase/functions/_features/**/*.tsx`
- Enforces:
  - features/ must only contain .ts files. Components belong in src/components/.

### layers/logger

- Location: src/common/cross-cutting/logger.mjs
- Target: files: `supabase/functions/_features/**/*.ts` / ignores: `supabase/functions/_features/**/entries/*.ts`
- Enforces:
  - console 呼び出しを禁止
  - logger is not allowed outside entries. Logging belongs in entries.

### imports/feature-other

- Location: src/common/cross-cutting/feature-default-imports.mjs
- Target: files: `supabase/functions/_features/**/*.ts` / ignores: `supabase/functions/_features/**/services/*.ts`, `supabase/functions/_features/**/queries/*.ts`, `supabase/functions/_features/**/entries/*.ts`, `supabase/functions/_features/**/utils/*.ts`, `supabase/functions/_features/**/types/*.ts`
- Enforces:
  - lib/* can only be imported from queries (lib-boundary violation)
  - Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.

### jsdoc

- Location: src/common/cross-cutting/jsdoc.mjs
- Target: files: `supabase/functions/_features/**/queries/*.ts`, `supabase/functions/_features/**/services*/*.ts`, `supabase/functions/_features/**/utils*/*.ts`
- Enforces:
  - JSDoc の付与を強制
  - JSDoc に description を必須化

### imports/ban-alias

- Location: src/common/cross-cutting/ban-alias.mjs
- Target: files: `supabase/functions/_features/**/*.ts`
- Enforces:
  - Alias imports (@/) are not available in this environment. Use relative paths.

### deno/lib-boundary

- Location: src/deno/boundaries/lib.mjs
- Target: files: `supabase/functions/**/*.ts` / ignores: `supabase/functions/_lib/**`, `supabase/functions/_features/**/queries/**`, `supabase/functions/_features/**/types/**`
- Enforces:
  - _lib/ can only be imported from queries (lib-boundary violation)

### deno/entry-point

- Location: src/deno/boundaries/entry-point.mjs
- Target: files: `supabase/functions/**/*.ts` / ignores: `supabase/functions/_*/**`
- Enforces:
  - Top-level files must not import services directly. Import from entries instead.
  - Top-level files must not import queries directly. Import from entries instead.
  - Top-level files must not import _lib/ directly. Import from entries instead.

### deno/flat-entry-point

- Location: src/deno/boundaries/entry-point.mjs
- Target: files: `supabase/functions/**/*.ts` / ignores: `supabase/functions/_*/**`
- Enforces:
  - `deno-local/flat-entry-point` (local plugin)

### deno/utils-boundary

- Location: src/deno/boundaries/utils.mjs
- Target: files: `supabase/functions/_utils/**/*.ts`
- Enforces:
  - _utils/ cannot import _features/
  - _utils/ cannot import _lib/

### entry-points/no-namespace-import

- Location: src/common/boundaries/entry-point.mjs
- Target: files: `supabase/functions/**/*.ts` / ignores: `supabase/functions/_*/**`
- Enforces:
  - Entry points must use named imports instead of `import * as`. This makes dependencies explicit.
