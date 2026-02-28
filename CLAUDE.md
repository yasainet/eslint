# CLAUDE.md

Shared ESLint flat config that enforces feature-based architecture. Provides `./next` and `./node` entry points for environment-specific configurations.

## Project Overview

`@yasainet/eslint` provides three entry points:

- `@yasainet/eslint/next` — common rules + Next.js-specific rules (hooks/components naming, directives)
- `@yasainet/eslint/node` — common rules only
- `@yasainet/eslint/deno` — common rules only (Supabase Edge Functions)

Key design points:

- Each config module exports a factory function (`create*Configs(featureRoot)`) that scopes rules to a single feature root directory. Entry points bake in their own root: `next` uses `"src/features"`, `node` uses `"scripts/features"`
- `common/constants.mjs` scans the consuming project's `src/lib/` directory at lint-time to build `PREFIX_LIB_MAPPING` (e.g., `{ server: "@/lib/supabase/server" }`). This mapping drives `naming.mjs` (valid file prefixes) and `imports.mjs` (per-prefix import restrictions)
- `featuresGlob(featureRoot, subpath)` generates a glob pattern scoped to the given root
- `libBoundaryConfigs` is a Next.js-only config (exported separately from `imports.mjs`) that restricts `@/lib/*` imports to repositories and types across all `src/` files. `utils` also receive lib-boundary restrictions via `createImportsConfigs`
- `naming.mjs` treats the `shared` feature specially: `repositories-shared` allows any kebab-case name (no DB prefix required), `types-shared` and `utils-shared` accept both `shared` and lib prefixes (e.g., `shared.type.ts`, `server.util.ts`)
- DB prefix is auto-derived from `PREFIX_LIB_MAPPING`: entries whose value contains `/` are treated as DB-client origins (e.g., `server` → `supabase/server`). Non-shared repositories require one of these DB prefixes
- `@yasainet/eslint/next` does NOT include Next.js presets (core-web-vitals, typescript). Consumer adds those separately via `eslint-config-next`

## Tech Stack

- ESLint 9 flat config (ESM only, `.mjs`)
- No build step — source files in `src/` are shipped directly
- No test framework — verify by running `npm install` in a consuming project
- Each config module exports a factory function (e.g., `createLayersConfigs(featureRoot)`, `createNamingConfigs(featureRoot)`)
- Code comments and JSDoc descriptions in English

## Environment Architecture

- **Local development**: `npm install` in a consuming Next.js or Node.js project to verify config behavior
- **CI/CD**: GitHub Actions triggers on `v*` tags to publish to npm
- **npm**: Published as `@yasainet/eslint`, consumed via `npm install @yasainet/eslint`

## Directory Structure

```text
src/
├── common/
│   ├── index.mjs        # createCommonConfigs(featureRoot) — aggregator factory
│   ├── constants.mjs    # PREFIX_LIB_MAPPING, featuresGlob(featureRoot, subpath)
│   ├── plugins.mjs      # Common plugins (stylistic, checkFile, jsdoc, simpleImportSort)
│   ├── rules.mjs        # Shared rules (TypeScript, stylistic, import sorting, no-console)
│   ├── naming.mjs       # createNamingConfigs(featureRoot) — services, repos(+shared), actions, types(+shared), schemas, utils(+shared), constants
│   ├── layers.mjs       # createLayersConfigs(featureRoot) — repos, services
│   ├── imports.mjs      # createImportsConfigs(featureRoot) + libBoundaryConfigs (Next.js-only); utils lib-boundary
│   └── jsdoc.mjs        # createJsdocConfigs(featureRoot)
├── next/
│   ├── index.mjs        # Entry: createCommonConfigs("src/features") + libBoundaryConfigs + Next.js rules
│   ├── naming.mjs       # hooks (filename + export), components naming (hardcoded to src/)
│   └── directives.mjs   # "use server" / "use client" (hardcoded to src/features/)
├── node/
│   └── index.mjs        # Entry: createCommonConfigs("scripts/features")
└── deno/
    └── index.mjs        # Entry: createCommonConfigs("supabase/functions/features")
```

## Commands

```bash
npm install   # Install dependencies (no build or test commands)
```

## Verification

```bash
node -e "import('./src/next/index.mjs').then(m => console.log('next:', Object.keys(m)))"
node -e "import('./src/node/index.mjs').then(m => console.log('node:', Object.keys(m)))"
```
