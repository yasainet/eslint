# @yasainet/eslint

Shared ESLint configuration for Next.js projects with feature-based architecture.

## Install

```sh
npm install -D @yasainet/eslint eslint eslint-config-next
```

## Usage

```js
// eslint.config.mjs
import { eslintConfig } from "@yasainet/eslint";

export default eslintConfig;
```

## Rules

### Base

Next.js recommended presets (core-web-vitals + typescript) with additional rules:

- `@typescript-eslint/consistent-type-imports` — enforce `type` imports
- `@typescript-eslint/no-unused-vars` — disallow unused variables (allows `_` prefix)
- `no-console` — warn on `console.*`
- `simple-import-sort` — auto-sort imports/exports
- `@stylistic/quotes` — enforce double quotes
- `react-you-might-not-need-an-effect` — detect unnecessary `useEffect`

### Naming

Enforces file naming conventions inside `features/`:

| Directory       | Pattern              | Example            |
| --------------- | -------------------- | ------------------ |
| `domain/`       | `{prefix}.domain.ts` | `server.domain.ts` |
| `repositories/` | `{prefix}.repo.ts`   | `server.repo.ts`   |
| `actions/`      | `{prefix}.action.ts` | `server.action.ts` |
| `hooks/`        | `use{Name}.ts`       | `useAuth.ts`       |
| `types/`        | `{name}.type.ts`     | `comic.type.ts`    |
| `schemas/`      | `{name}.schema.ts`   | `comic.schema.ts`  |
| `util/`         | `{name}.util.ts`     | `format.util.ts`   |
| `constants/`    | `{name}.constant.ts` | `api.constant.ts`  |

Additionally:

- `features/**` — `.ts` only (components belong in `src/components/`)
- `components/**` — `.tsx` only (logic belongs in `src/features/`)

### Layers

Enforces dependency direction between layers:

```
hooks → actions → domain → repositories
```

- **Repositories** — cannot import domain/actions/hooks, no `try-catch` or `if`
- **Domain** — cannot import actions/hooks, no `try-catch`
- **Actions** — cannot import hooks, exports must start with `handle`
- **Hooks** — exports must start with `use`

Cross-feature imports within the same layer are prohibited.

### Cardinality

Each action can only import its matching domain:

- `server.action.ts` → `server.domain.ts`
- `client.action.ts` → `client.domain.ts`
- `admin.action.ts` → `admin.domain.ts`

### Directives

Enforces `"use server"` / `"use client"` directives:

- `server.action.ts` / `admin.action.ts` — must start with `"use server"`
- `client.action.ts` — must NOT have `"use server"`
- `hooks/*.ts` — must start with `"use client"`

### Imports

Each `{prefix}.repo.ts` can only import its corresponding lib (auto-generated from `src/lib/`):

- `server.repo.ts` → `@/lib/supabase/server`
- `client.repo.ts` → `@/lib/supabase/client`

## Release

1. Update `version` in `package.json`
2. Commit and push to `main`
3. Create and push a tag:

```sh
git tag v0.2.0
git push --tags
```

4. GitHub Actions will automatically publish to npm

## License

MIT
