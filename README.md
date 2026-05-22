# @yasainet/eslint

Shared ESLint configuration for Next.js, Node.js and Deno.

## Entry Points

- `@yasainet/eslint/next` — Common rules + Next.js
  - Feature Root: `src/features/`
- `@yasainet/eslint/node` — Common rules for CLI scripts
  - Feature Root: `scripts/features/`
  - Entry Points: `scripts/commands/*.ts`
- `@yasainet/eslint/deno` — Common rules for Supabase Edge Functions
  - Feature Root: `supabase/functions/_features/`

## Setup

利用 entry 別の install / config template は [`docs/setup.md`](./docs/setup.md) を参照。

## Release

Git tag (`vX.Y.Z`) を push すると GitHub Actions が npm に publish する。
