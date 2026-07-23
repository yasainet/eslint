# Setup

利用する entry に応じて以下の block を組み合わせる。複数 entry を使う場合は、各 block の `import` と config の spread を合成すればよい (末尾の「組み合わせ例」を参照)。

## Next.js (`src/`)

```sh
npm install -D @yasainet/eslint
```

```js
// eslint.config.mjs
import yasainetConfig from "@yasainet/eslint/next";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...yasainetConfig,
]);

export default eslintConfig;
```

## Node.js (`scripts/`)

```sh
npm install -D @yasainet/eslint eslint typescript-eslint
```

```js
# TODO: fix
// eslint.config.mjs
import yasainetConfig from "@yasainet/eslint/node";

export default [...yasainetConfig];
```

## Supabase Edge Functions (`supabase/functions/`)

```js
// eslint.config.mjs
import yasainetConfig from "@yasainet/eslint/deno";

export default [...yasainetConfig];
```

## Next.js + Node.js + Supabase Edge Functions

```sh
npm install -D @yasainet/eslint
```

```js
// eslint.config.mjs
import nextEslintConfig from "@yasainet/eslint/next";
import nodeEslintConfig from "@yasainet/eslint/node";
import denoEslintConfig from "@yasainet/eslint/deno";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...nextEslintConfig,
  ...nodeEslintConfig,
  ...denoEslintConfig,
]);
```

## test 粒度の gate (P9)

unit / e2e の粒度を機械判定・強制する。layer が分類器、test 方針はその注釈。

- PROHIBITION (ESLint): `services` / `queries` / `entries` に co-located test を置くと error。
  orchestration の unit は mock の echo になるため、検証は e2e に委ね、純粋ロジックは utils へ抽出する。
- PRESENCE (CLI): `schemas` + `utils` に「兄弟 `*.test.ts` OR `// @unit-exempt: <理由>`」を要求する。
  `schemas` は定義上 pure。`utils` は impure 混在のため marker で opt-out できる。

test は co-located (`x.ts` の隣に `x.test.ts`) で配置する。`package.json` に audit を組み込む:

```jsonc
// package.json
{
  "scripts": {
    "test:audit": "test-audit", // 既定 feature root: src/features
    // 別 root: "test-audit --feature-root scripts/features"
  },
}
```

`npm run test:audit` を Verification (lint / type-check / test と並べて) に組み込む。
