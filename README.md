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

Each entry point enforces a feature-based architecture. **Files do not carry role suffixes — the directory declares the role**:

```text
{featureRoot}/
├── {feature}/
│   ├── interactors/    # entry points (server.ts / admin.ts / client.ts)
│   ├── services/       # business logic (server.ts ...)
│   ├── queries/        # data access (one file per upstream lib: <lib-name>.ts)
│   ├── types/          # type defs (one file per feature: <feature>.ts)
│   ├── schemas/        # zod schemas (<feature>.ts)
│   ├── utils/          # pure helpers (<feature>.ts)
│   └── constants/      # constants (<feature>.ts)
├── shared/             # Cross-feature shared modules
{libRoot}/
├── {single-client-lib}/index.ts   # SDK wrapper entry (e.g., gallery-dl, fxembed, r2)
├── {single-client-lib}/types.ts   # raw SDK types
├── {single-client-lib}/<sub>.ts   # internal sub-modules (parser, etc.) — auto-hidden from queries
├── {multi-client-lib}/<role>.ts   # one role per file (e.g., supabase: admin / server / client / proxy)
└── {multi-client-lib}/types.ts
{utilsRoot}/            # top-level pure utilities (cn.ts / logger.ts ...)
```

### single-client vs multi-client lib

| Detected by                                  | Treated as       | Example                                       |
| -------------------------------------------- | ---------------- | --------------------------------------------- |
| `lib/<dir>/index.ts` exists                  | single-client    | `lib/gallery-dl/{index.ts, parser.ts, types.ts}` |
| `lib/<dir>/index.ts` absent                  | multi-client     | `lib/supabase/{admin.ts, server.ts, client.ts, ...}` |

For single-client libs the prefix mapping registers only the directory name, automatically hiding internal sub-modules (e.g., `parser.ts`) from the queries layer. For multi-client libs every plain `<role>.ts` is registered.

### File naming rules

- **No multi-extension suffixes** (`.lib`, `.service`, `.query`, `.util`, `.type`, `.schema`, `.constant`, `.interactor` are forbidden). The directory carries the role.
- `lib/<dir>/index.ts` for single-client lib entries (avoids `lib/<dir>/<dir>.ts` redundancy).
- `lib/<dir>/types.ts` and `lib/<dir>/proxy.ts` are excluded from the prefix mapping so queries cannot directly depend on them.
- `<feature>/{types,schemas,utils,constants}/<feature>.ts` — exactly one file per feature, named after the feature.
- `<feature>/queries/<lib-name>.ts` — file name must match a registered lib prefix; queries can only import from the matching lib (lib-boundary lint).

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
