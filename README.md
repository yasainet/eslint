# @yasainet/eslint-next

Shared ESLint configuration for Next.js projects with feature-based architecture.

## Install

```sh
npm install -D @yasainet/eslint-next eslint eslint-config-next
```

## Usage

```js
// eslint.config.mjs
import { eslintConfig } from "@yasainet/eslint-next";

export default eslintConfig;
```

## Release

1. Update `version` in `package.json`
2. Commit and push to `main`
3. Create and push a tag:

```sh
git tag v0.1.0
git push --tags
```

4. GitHub Actions will automatically publish to npm
