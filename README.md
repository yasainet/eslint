# @yasainet/eslint

Shared ESLint configuration for Next.js, Node.js and Deno.

## Entry Points

| Entry                   | Feature Root                   | Entry Points            | Description                   |
| ----------------------- | ------------------------------ | ----------------------- | ----------------------------- |
| `@yasainet/eslint/next` | `src/features/`                | -                       | Common rules + Next.js        |
| `@yasainet/eslint/node` | `scripts/features/`            | `scripts/commands/*.ts` | Common rules (CLI scripts)    |
| `@yasainet/eslint/deno` | `supabase/functions/features/` | -                       | Common rules (Edge Functions) |

## Architecture

`feature-based architecture` を ESLint で機械的に enforce する設定集。詳細な命名規約・directory 構造・各 layer の責務は [CLAUDE.md](./CLAUDE.md) を参照。consuming project の Claude Code は CLAUDE.md を読んで自動的に規約に従う。

## Setup

### Next.js + Node.js + Deno

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
    // Default ignores of eslint-config-next:
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

### Next.js

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
    // Default ignores of eslint-config-next:
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...eslintConfig,
]);
```

### Node.js

```sh
npm install -D @yasainet/eslint eslint typescript-eslint
```

```js
// eslint.config.mjs
import { eslintConfig } from "@yasainet/eslint/node";

export default [...eslintConfig];
```

### Deno

```sh
npm install -D @yasainet/eslint eslint typescript-eslint
```

```js
// eslint.config.mjs
import { eslintConfig } from "@yasainet/eslint/deno";

export default [...eslintConfig];
```

## Release

Version は Git tag から派生する。CI が自動で `package.json` の version を設定して publish する。

1. `main` にコミット & push
2. tag を作成 & push:

   ```sh
   git tag v1.0.0
   git push --tags
   ```

3. GitHub Actions が npm に publish する
