# CLAUDE.md

ESLint flat config used across @yasainet's Next.js / Node.js / Supabase Edge Functions projects.

## Summary

- npm package `@yasainet/eslint` のソースコード (next / node / deno entry を公開)
- consuming project の Claude Code は ESLint error message から自己修正することを前提に設計
- 規約の意図を理解したい場合は本ファイル / [docs/philosophy.md](./docs/philosophy.md) / 各 rule file の JSDoc を参照

## Constraints

- ESLint 9 flat config / ESM only (`.mjs`) / no build step / no test framework
- 検証は consuming project で `npm pack` して動作確認する (`npm link` 禁止)
- 新規 rule の置き場所判断は各 entry の `src/<entry>/CLAUDE.md` を参照
- 規約の詳細 (命名 / import 制約等) は ESLint error message と各 rule file の JSDoc を一次ソースとする

## Commands

- 依存インストール: `npm install`
- Layer selector 回帰チェック: `npm run check` (queries/services の no-restricted-syntax が logger に上書きされていないか検証 / publish CI でも実行)
- Rules catalog 再生成: `npm run docs` (`docs/rules.md` を上書き / 手動編集禁止)
- Release (patch): `/bump` skill (patch tag を作成 → push → CI が npm publish)
- Release (minor / major): 手動で tag 作成 (`git tag v1.1.0 && git push --tags`)

## Verification

Module exports の sanity check:

```bash
node -e "import('./src/next/index.mjs').then(m => console.log('next:', Object.keys(m)))"
node -e "import('./src/node/index.mjs').then(m => console.log('node:', Object.keys(m)))"
node -e "import('./src/deno/index.mjs').then(m => console.log('deno:', Object.keys(m)))"
```

consuming project での動作確認:

1. local pack: `cd ~/Projects/eslint && npm pack --pack-destination /tmp`
2. tarball install: `cd ~/Projects/<project> && npm install /tmp/yasainet-eslint-*.tgz`
3. lint 動作確認
