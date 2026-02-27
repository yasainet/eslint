# @yasainet/eslint

Shared ESLint configuration for feature-based architecture.

## Install

```sh
npm install -D @yasainet/eslint eslint
```

## Usage

### Next.js

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { eslintConfig } from "@yasainet/eslint/next";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  ...eslintConfig,
]);
```

### Node.js

```js
// eslint.config.mjs
import { eslintConfig } from "@yasainet/eslint/node";

export default eslintConfig;
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
