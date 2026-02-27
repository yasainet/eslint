# Layers

レイヤーアーキテクチャの依存方向を強制し、各レイヤーの責務を明確にする。
上位レイヤーから下位レイヤーへの一方向依存を保つことで、変更の影響範囲を限定する。

## ルール

### レイヤー構造

```text
hooks → actions → domain → repositories
（上位）                        （下位）
```

下位レイヤーは上位レイヤーをインポートできない。

### 構文制約

| レイヤー | 制約 | 理由 |
| --- | --- | --- |
| repositories | `try-catch` 禁止 | エラーハンドリングは actions の責務 |
| repositories | `if` 文禁止 | 条件分岐は domain の責務 |
| domain | `try-catch` 禁止 | エラーハンドリングは actions の責務 |

### エクスポート命名規則

| レイヤー | 規則 | 例 |
| --- | --- | --- |
| actions | `handle` で始まる | `handleGetComics`, `handleCreateThread` |
| hooks | `use` で始まる | `useAuth`, `useThreadList` |

### インポート制限

レイヤー間のインポート制限は `imports.mjs` に統合されている（詳細は [imports.md](imports.md) を参照）。

| レイヤー | インポート禁止対象 |
| --- | --- |
| repositories | domain, actions, hooks |
| domain | actions, hooks |
| actions | hooks |

同一レイヤーの別フィーチャーからのインポートも禁止:

- `repositories` 同士のクロスフィーチャーインポート禁止
- `domain` 同士のクロスフィーチャーインポート禁止
- `actions` 同士のクロスフィーチャーインポート禁止

## 対象ファイル

- 構文制約: `**/repositories/*.ts`, `**/domain/*.ts`（全プロジェクト）
- エクスポート命名: `FEATURE_ROOTS` 配下の `**/actions/*.ts`, `**/hooks/*.ts`

## エラー例・OK 例

### repositories の構文制約

```ts
// NG: repositories 内で try-catch
export function getUser(id: string) {
  try {
    return db.query("SELECT * FROM users WHERE id = ?", [id]);
  } catch (e) {
    // error: try-catch is not allowed in repositories.
    //        Error handling belongs in actions.
  }
}

// NG: repositories 内で if
export function getUser(id: string) {
  if (!id) {
    // error: if statements are not allowed in repositories.
    //        Conditional logic belongs in domain.
    return null;
  }
  return db.query("SELECT * FROM users WHERE id = ?", [id]);
}

// OK: repositories はデータアクセスのみ
export function getUser(id: string) {
  return db.query("SELECT * FROM users WHERE id = ?", [id]);
}
```

### actions のエクスポート命名

```ts
// NG: handle で始まっていない
export function getComics() { ... }
//             ^^^^^^^^^ error: Exported functions in actions must
//                        start with 'handle'

// OK
export function handleGetComics() { ... }
```

### hooks のエクスポート命名

```ts
// NG: use で始まっていない
export function authHook() { ... }
//             ^^^^^^^^ error: Exported functions in hooks must
//                      start with 'use'

// OK
export function useAuth() { ... }
```
