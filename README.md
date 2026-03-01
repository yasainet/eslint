# @yasainet/eslint

Shared ESLint configuration for Next.js, Node.js and Deno.

## Entry Points

| Entry                   | Feature Root                   | Description             |
| ----------------------- | ------------------------------ | ----------------------- |
| `@yasainet/eslint/next` | `src/features/`                | Common rules + Next.js  |
| `@yasainet/eslint/node` | `scripts/features/`            | Common rules only (WIP) |
| `@yasainet/eslint/deno` | `supabase/functions/features/` | Common rules only (WIP) |

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

1. Update `version` in `package.json`
2. Commit and push to `main`
3. Create and push a tag:

```sh
git tag v1.0.0
git push --tags
```

4. GitHub Actions will automatically publish to npm

### With lazygit

1. Update `version` in `package.json`
2. Stage and commit in lazygit
3. Select the commit, press `T` to create a tag (e.g. `v1.0.0`)
4. Press `P` to push the commit
5. Switch to the Tags panel (`]`), select the tag, and press `P` to push it
6. GitHub Actions will automatically publish to npm
