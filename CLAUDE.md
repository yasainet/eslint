# CLAUDE.md

Shared ESLint flat config for Next.js projects that enforces feature-based architecture.

## Project Overview

`@yasainet/eslint-next` provides a single `eslintConfig` array that aggregates all config modules in order: base → ignores → shared rules → naming → layers → directives → imports → jsdoc.

Key design points:

- `constants.mjs` scans the consuming project's `src/lib/` directory at lint-time to build `PREFIX_LIB_MAPPING` (e.g., `{ server: "@/lib/supabase/server" }`). This mapping drives `naming.mjs` (valid file prefixes) and `imports.mjs` (per-prefix import restrictions)
- Rules apply across three feature root directories defined in `FEATURE_ROOTS`: `src/features`, `scripts/features`, `supabase/functions/features`. The `featuresGlob()` helper generates glob patterns for all roots

## Tech Stack

- ESLint 9 flat config (ESM only, `.mjs`)
- No build step — source files in `src/` are shipped directly
- No test framework — verify by running `npm install` in a consuming Next.js project
- Each config module exports a named `*Configs` array (e.g., `layersConfigs`, `namingConfigs`)
- Code comments and JSDoc descriptions in English

## Environment Architecture

- **Local development**: `npm install` in a consuming Next.js project to verify config behavior
- **CI/CD**: GitHub Actions triggers on `v*` tags to publish to npm
- **npm**: Published as `@yasainet/eslint-next`, consumed via `npm install @yasainet/eslint-next`

## Directory Structure

```text
src/
  index.mjs       # Entry point — aggregates all config modules into eslintConfig
  constants.mjs   # FEATURE_ROOTS, PREFIX_LIB_MAPPING (auto-generated from src/lib/), featuresGlob()
  plugins.mjs     # Plugin imports and re-exports
  base.mjs        # Next.js presets (core-web-vitals + typescript) and shared rules
  naming.mjs      # File naming conventions per directory (services, repo, action, hook, etc.)
  layers.mjs      # Layer dependency direction: hooks → actions → services → repositories
  directives.mjs  # "use server" / "use client" directive enforcement
  imports.mjs     # Consolidated import restrictions (layer, cross-feature, cardinality, prefix-lib, lib-boundary)
  jsdoc.mjs       # JSDoc description requirements for repositories, services, utils
```

## Commands

```bash
npm install   # Install dependencies (no build or test commands)
```

## Verification

```bash
node -e "import('./src/index.mjs').then(m => console.log(Object.keys(m)))"
```
