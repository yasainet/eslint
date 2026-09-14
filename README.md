# @yasainet/eslint

Shared ESLint configuration for Next.js.

## Setup

```sh
npm install -D @yasainet/eslint
```

```js
// eslint.config.mjs
import yasainetConfig from "@yasainet/eslint/next";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...yasainetConfig,
]);

export default eslintConfig;
```

## Verify

```sh
npm run lint:md
npm run check

# Module exports の sanity check
node -e "import('./src/next/index.mjs').then(m => console.log('next:', Object.keys(m)))"
```

consuming project での動作確認:

```sh
# local pack
cd $(ghq root)/github.com/yasainet/eslint && npm pack --pack-destination /tmp

# tarball install
cd $(ghq root)/github.com/<owner>/<repo> && npm install /tmp/yasainet-eslint-*.tgz

# lint 動作確認
npm run lint
```

## Release

Git tag (`vX.Y.Z`) を push すると GitHub Actions が npm に publish する。
