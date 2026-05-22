# Setup

利用する entry に応じて以下の block を組み合わせる。複数 entry を使う場合は、各 block の `import` と `eslintConfig` の spread を合成すればよい (末尾の「組み合わせ例」を参照)。

## Next.js (`src/`)

```sh
npm install -D @yasainet/eslint
```

```js
// eslint.config.mjs
import { eslintConfig } from "@yasainet/eslint/next";
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
  ...eslintConfig,
]);
```

## Node.js (`scripts/`)

```sh
npm install -D @yasainet/eslint eslint typescript-eslint
```

```js
// eslint.config.mjs
import { eslintConfig } from "@yasainet/eslint/node";

export default [...eslintConfig];
```

## Supabase Edge Functions (`supabase/functions/`)

```js
// eslint.config.mjs
import { eslintConfig } from "@yasainet/eslint/deno";

export default [...eslintConfig];
```

## Next.js + Node.js + Supabase Edge Functions

```sh
npm install -D @yasainet/eslint
```

```js
// eslint.config.mjs
import { eslintConfig as nextEslintConfig } from "@yasainet/eslint/next";
import { eslintConfig as nodeEslintConfig } from "@yasainet/eslint/node";
import { eslintConfig as denoEslintConfig } from "@yasainet/eslint/deno";
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
