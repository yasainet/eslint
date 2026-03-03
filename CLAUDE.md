# CLAUDE.md

Shared ESLint flat config that enforces feature-based architecture. Provides `./next` and `./node` entry points for environment-specific configurations.

## Project Overview

`@yasainet/eslint` provides three entry points: `@yasainet/eslint/next`, `@yasainet/eslint/node`, `@yasainet/eslint/deno`

## Tech Stack

- ESLint 9 flat config (ESM only, `.mjs`)
- No build step, no test framework — verify by running `npm install` in a consuming project
- Code comments and JSDoc descriptions in English

## Environment Architecture

- **Local development**: `npm install` in a consuming Next.js or Node.js project to verify config behavior
- **CI/CD**: GitHub Actions triggers on `v*` tags to publish to npm
- **npm**: Published as `@yasainet/eslint`, consumed via `npm install @yasainet/eslint`

## Directory Structure

```text
src/
├── common/   # Shared rules for all environments
├── next/     # Next.js-specific rules (hooks, components, directives)
├── node/     # Node.js entry point (common rules only)
└── deno/     # Deno entry point (entry-point boundary, _utils boundary, _lib boundary)
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
