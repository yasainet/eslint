import { ESLint } from "eslint";

import nextConfig from "../src/next/index.mjs";

const entries = [
  {
    name: "next",
    config: nextConfig,
    inScope: "src/features/shared/utils/sample.ts",
    outOfScope: "scripts/faceswap.ts",
  },
];

const FOREIGN_BROAD_TS_CONFIG = {
  name: "foreign/broad-ts",
  files: ["**/*.ts", "**/*.tsx"],
  rules: {},
};

const cwd = new URL("..", import.meta.url).pathname;
const failures = [];

async function noConsoleRuleFor(eslint, file) {
  const cfg = await eslint.calculateConfigForFile(file);
  return cfg?.rules?.["no-console"];
}

for (const { name, config, inScope, outOfScope } of entries) {
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: config,
  });

  const inScopeRule = await noConsoleRuleFor(eslint, inScope);
  const outOfScopeRule = await noConsoleRuleFor(eslint, outOfScope);

  if (inScopeRule === undefined) {
    failures.push(
      `[${name}] ${inScope}\n  expected no-console to be configured, got: undefined`,
    );
  }
  if (outOfScopeRule !== undefined) {
    failures.push(
      `[${name}] ${outOfScope}\n  expected no-console to be unconfigured (outside src/ scope), got: ${JSON.stringify(outOfScopeRule)}`,
    );
  }

  const combinedEslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: [FOREIGN_BROAD_TS_CONFIG, ...config],
  });
  const combinedOutOfScopeRule = await noConsoleRuleFor(
    combinedEslint,
    outOfScope,
  );
  if (combinedOutOfScopeRule !== undefined) {
    failures.push(
      `[${name}+foreign] ${outOfScope}\n  expected no-console to be unconfigured even when combined with a foreign broad-ts config, got: ${JSON.stringify(combinedOutOfScopeRule)}`,
    );
  }
}

if (failures.length > 0) {
  console.error("rule scoping check FAILED:\n");
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log("rule scoping check passed (next).");
