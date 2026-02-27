# JSDoc

抽象度の高いレイヤー（repositories, services, utils）にドキュメントを強制する。
型情報は TypeScript が担うため、JSDoc では「なぜこの関数が存在するか」の説明のみを求める。

## ルール

| ルール | レベル | 説明 |
| --- | --- | --- |
| `jsdoc/require-jsdoc` | warn | エクスポートされた関数に JSDoc ブロックを要求 |
| `jsdoc/require-description` | warn | JSDoc ブロックに description を要求 |

### 対象レイヤーと除外レイヤー

| レイヤー | JSDoc 必須 | 理由 |
| --- | --- | --- |
| repositories | 必須 | 外部システムとのインターフェースであり、何を取得・変更するか説明が必要 |
| services | 必須 | ビジネスロジックの意図を明示するため |
| utils | 必須 | 汎用関数の用途を明示するため |
| actions | 不要 | `handle` プレフィックスと引数型で意図が明確 |
| hooks | 不要 | `use` プレフィックスと React の慣習で意図が明確 |
| components | 不要 | Props 型と JSX で意図が明確 |
| schemas | 不要 | Zod スキーマ自体がドキュメント |
| constants | 不要 | 定数名と型で意図が明確 |

### 必要な JSDoc の書き方

```ts
/**
 * @description Fetch a user by ID from the database.
 */
export function getUser(id: string) { ... }
```

- `@description` のみ使用する（`@param`, `@returns` 等は TypeScript が担う）
- 「何をするか」ではなく「なぜ存在するか」を書く
- 長くなる場合は箇条書きを使う

## 対象ファイル

`FEATURE_ROOTS` 配下:

- `**/repositories/*.ts`
- `**/services*/*.ts`
- `**/utils*/*.ts`

## エラー例・OK 例

### JSDoc なし

```ts
// NG: エクスポート関数に JSDoc がない
export function getUser(id: string) {
  // warn: Missing JSDoc comment.
  return db.query("SELECT * FROM users WHERE id = ?", [id]);
}
```

### description なし

```ts
// NG: JSDoc はあるが description がない
/**
 * @param id - User ID
 */
export function getUser(id: string) {
  // warn: Missing JSDoc @description declaration.
  return db.query("SELECT * FROM users WHERE id = ?", [id]);
}
```

### OK

```ts
/**
 * @description Fetch a user by ID from the database.
 */
export function getUser(id: string) {
  return db.query("SELECT * FROM users WHERE id = ?", [id]);
}
```

### 箇条書きの例

```ts
/**
 * @description
 * - Calculate the total price including tax and discount.
 * - Returns 0 if the cart is empty.
 */
export function calculateTotal(cart: CartItem[]) { ... }
```
