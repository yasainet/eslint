# @yasainet/eslint

Shared ESLint configuration for feature-based architecture.

## Install

```sh
npm install -D @yasainet/eslint eslint
```

## Entry Points

| Entry                   | Feature Root                   | Description                                                                         |
| ----------------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| `@yasainet/eslint/next` | `src/features/`                | Common rules + Next.js-specific rules (hooks, components, directives, lib-boundary) |
| `@yasainet/eslint/node` | `scripts/features/`            | Common rules only                                                                   |
| `@yasainet/eslint/deno` | `supabase/functions/features/` | Common rules only                                                                   |

## Usage

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

## Release

1. Update `version` in `package.json`
2. Commit and push to `main`
3. Create and push a tag:

```sh
git tag v1.0.0
git push --tags
```

4. GitHub Actions will automatically publish to npm
