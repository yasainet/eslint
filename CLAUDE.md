# CLAUDE.md

Shared ESLint flat config that enforces feature-based architecture. Provides `./next` and `./node` entry points for environment-specific configurations.

## Project Overview

`@yasainet/eslint` provides two entry points:
- `@yasainet/eslint/next` — common rules + Next.js-specific rules (React effect linting, hooks/components naming, directives)
- `@yasainet/eslint/node` — common rules only

Key design points:

- `common/constants.mjs` scans the consuming project's `src/lib/` directory at lint-time to build `PREFIX_LIB_MAPPING` (e.g., `{ server: "@/lib/supabase/server" }`). This mapping drives `naming.mjs` (valid file prefixes) and `imports.mjs` (per-prefix import restrictions)
- Rules apply across three feature root directories defined in `FEATURE_ROOTS`: `src/features`, `scripts/features`, `supabase/functions/features`. The `featuresGlob()` helper generates glob patterns for all roots
- `@yasainet/eslint/next` does NOT include Next.js presets (core-web-vitals, typescript). Consumer adds those separately via `eslint-config-next`

## Tech Stack

- ESLint 9 flat config (ESM only, `.mjs`)
- No build step — source files in `src/` are shipped directly
- No test framework — verify by running `npm install` in a consuming project
- Each config module exports a named `*Configs` array (e.g., `layersConfigs`, `namingConfigs`)
- Code comments and JSDoc descriptions in English

## Environment Architecture

- **Local development**: `npm install` in a consuming Next.js or Node.js project to verify config behavior
- **CI/CD**: GitHub Actions triggers on `v*` tags to publish to npm
- **npm**: Published as `@yasainet/eslint`, consumed via `npm install @yasainet/eslint`

## Directory Structure

```text
src/
├── common/
│   ├── index.mjs        # Common configs aggregator
│   ├── constants.mjs    # FEATURE_ROOTS, PREFIX_LIB_MAPPING, featuresGlob()
│   ├── plugins.mjs      # Common plugins (stylistic, checkFile, jsdoc, simpleImportSort)
│   ├── rules.mjs        # Shared rules (TypeScript, stylistic, import sorting, no-console)
│   ├── naming.mjs       # Common naming (services, repos, actions, types, schemas, utils, constants)
│   ├── layers.mjs       # Common layers (repos, services, actions)
│   ├── imports.mjs      # Import restrictions (layer, cross-feature, cardinality, prefix-lib, lib-boundary)
│   └── jsdoc.mjs        # JSDoc requirements
├── next/
│   ├── index.mjs        # Entry: common + Next.js-specific rules
│   ├── plugins.mjs      # reactYouMightNotNeedAnEffect
│   ├── rules.mjs        # React-specific rules
│   ├── naming.mjs       # hooks, components naming
│   ├── layers.mjs       # hooks layer constraint
│   └── directives.mjs   # "use server" / "use client"
└── node/
    └── index.mjs        # Entry: common only
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
