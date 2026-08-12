# Setup

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
  },
}
```

`npm run test:audit` を Verification (lint / type-check / test と並べて) に組み込む。
