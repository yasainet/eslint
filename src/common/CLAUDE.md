# src/common/CLAUDE.md

全 entry で共有する rule の置き場所判断 (target 基準):

- `_internal/` — private 実装詳細 (constants / plugins / selectors / import-patterns)。consumer から見えない
- `base/` — 全ファイル対象の generic rule (TypeScript syntactic / type-aware)
- `boundaries/<surface>.mjs` — 外界 → features の入口で enforce する契約
- `cross-cutting/` — 複数 layer に跨る規約
  - 例 (naming): feature-name / namespace-import / form-state
  - 例 (rule): logger / jsdoc / no-any-return / supabase-columns-satisfies
- `layers/<layer>.mjs` — features 内部の階層単位
  - 種類: queries / services / entries / utils / constants / schemas / types
  - 1 layer の全制約 (naming + syntax + imports + local rules) を 1 file に集約
- `layers/top-level/<layer>.mjs` — features と同階層 (top-level) のディレクトリ単位
  - 種類: lib / utils
- `local-plugins/` — ESLint local plugin の実装本体
- `index.mjs` — common entry。上記 file を合成して export

新規 rule の glob が単一 layer に閉じるなら `layers/`、跨ぐなら `cross-cutting/`、外界の caller surface なら `boundaries/` に置く。
