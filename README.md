# @yasainet/eslint

Shared ESLint configuration for Next.js, Node.js and Deno.

## Entry Points

| Entry                   | Feature Root                   | Entry Points            | Description                   |
| ----------------------- | ------------------------------ | ----------------------- | ----------------------------- |
| `@yasainet/eslint/next` | `src/features/`                | -                       | Common rules + Next.js        |
| `@yasainet/eslint/node` | `scripts/features/`            | `scripts/commands/*.ts` | Common rules (CLI scripts)    |
| `@yasainet/eslint/deno` | `supabase/functions/features/` | -                       | Common rules (Edge Functions) |

## Directory Structure

```text
src/
├── common/   # Shared rules for all environments
├── next/     # Next.js-specific rules (hooks, components, directives)
├── node/     # Node.js CLI scripts (scripts/features, scripts/commands)
└── deno/     # Deno entry point (entry-point boundary, _utils boundary, _lib boundary)
```

Each entry point enforces a feature-based architecture with the following convention in consuming projects:

```text
{featureRoot}/
├── {feature}/
│   ├── interactors/    # *.interactor.ts — entry points
│   ├── services/       # *.service.ts — business logic
│   ├── queries/        # *.query.ts — data access
│   ├── types/          # *.type.ts
│   ├── schemas/        # *.schema.ts
│   ├── utils/          # *.util.ts
│   └── constants/      # *.constant.ts
├── shared/             # Cross-feature shared modules
├── ...
{libRoot}/              # *.lib.ts — library wrappers (e.g., supabase.lib.ts)
{utilsRoot}/            # *.util.ts — top-level utilities
```

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

Version is derived from the Git tag. CI automatically sets `package.json` version before publishing.

1. Commit and push to `main`
2. Create and push a tag:

```sh
git tag v1.0.0
git push --tags
```

3. GitHub Actions will automatically publish to npm
