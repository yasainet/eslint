# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@yasainet/eslint-next` is a shared ESLint flat config for Next.js projects that enforces feature-based architecture. It provides rules for file naming, layer dependencies, cardinality constraints, RSC directives, and import restrictions.

## Tech Stack

- ESLint 9 flat config (ESM only, `.mjs`)
- No build step — source files in `src/` are shipped directly
- No test framework — verify by running `npm install` in a consuming Next.js project
- Published to npm via GitHub Actions on `v*` tags

## Directory Structure

```text
src/
  index.mjs       # Entry point — aggregates all config modules into eslintConfig
  constants.mjs   # FEATURE_ROOTS, PREFIX_LIB_MAPPING (auto-generated from src/lib/), featuresGlob()
  plugins.mjs     # Plugin imports and re-exports
  base.mjs        # Next.js presets (core-web-vitals + typescript) and shared rules
  naming.mjs      # File naming conventions per directory (domain, repo, action, hook, etc.)
  layers.mjs      # Layer dependency direction: hooks → actions → domain → repositories
  cardinality.mjs # 1:1 action-to-domain mapping (server→server, client→client, admin→admin)
  directives.mjs  # "use server" / "use client" directive enforcement
  imports.mjs     # Repository import restrictions (prefix → lib mapping)
  jsdoc.mjs       # JSDoc description requirements for repositories, domain, util
```

## Commands

```bash
npm install   # Install dependencies (no build or test commands)
```

## Architecture

### Config composition

`index.mjs` exports a single `eslintConfig` array that spreads all config modules in order: base → ignores → shared rules → naming → layers → cardinality → directives → imports → jsdoc.

### Dynamic config generation

`constants.mjs` scans the consuming project's `src/lib/` directory at lint-time to build `PREFIX_LIB_MAPPING` (e.g., `{ server: "@/lib/supabase/server" }`). This mapping drives:

- `naming.mjs` — valid file prefixes (e.g., `server.repo.ts`, `client.action.ts`)
- `imports.mjs` — per-prefix import restrictions for repository files

### Feature roots

Rules apply across three feature root directories defined in `FEATURE_ROOTS`: `src/features`, `scripts/features`, `supabase/functions/features`. The `featuresGlob()` helper generates glob patterns for all roots.

### Conventions

- All source files are `.mjs` (ESM)
- Code comments and JSDoc descriptions in English
- Each config module exports a named `*Configs` array (e.g., `layersConfigs`, `namingConfigs`)

## Verification

```bash
node -e "import('./src/index.mjs').then(m => console.log(Object.keys(m)))"
```
