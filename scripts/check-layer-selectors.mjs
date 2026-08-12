import { ESLint } from "eslint";

import nextConfig from "../src/next/index.mjs";

const QUERIES_REQUIRED = [
  "TryStatement",
  "IfStatement",
  "ForStatement",
  "ForOfStatement",
  "ForInStatement",
  "WhileStatement",
  "DoWhileStatement",
  "ThrowStatement",
];
const SERVICES_REQUIRED = ["TryStatement", "ThrowStatement"];
const LOGGER_SELECTOR = "CallExpression[callee.object.name='logger']";

const entries = [{ name: "next", config: nextConfig, root: "src/features" }];

const cwd = new URL("..", import.meta.url).pathname;
const failures = [];

async function selectorsFor(eslint, file) {
  const cfg = await eslint.calculateConfigForFile(file);
  const nrs = cfg.rules?.["no-restricted-syntax"];
  if (!Array.isArray(nrs)) return [];
  return nrs
    .slice(1)
    .flatMap((o) => o.selector.split(",").map((s) => s.trim()));
}

function expect(label, file, actual, required) {
  const missing = required.filter((s) => !actual.includes(s));
  if (missing.length > 0) {
    failures.push(`${label} ${file}\n  missing: ${missing.join(", ")}`);
  }
}

for (const { name, config, root } of entries) {
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: config,
  });

  const queriesFile = `${root}/shared/queries/sample.ts`;
  const servicesFile = `${root}/shared/services/sample.ts`;
  const utilsFile = `${root}/shared/utils/sample.ts`;

  const queries = await selectorsFor(eslint, queriesFile);
  const services = await selectorsFor(eslint, servicesFile);
  const utils = await selectorsFor(eslint, utilsFile);

  expect(`[${name}] queries`, queriesFile, queries, [
    ...QUERIES_REQUIRED,
    LOGGER_SELECTOR,
  ]);
  expect(`[${name}] services`, servicesFile, services, [
    ...SERVICES_REQUIRED,
    LOGGER_SELECTOR,
  ]);
  expect(`[${name}] utils`, utilsFile, utils, [LOGGER_SELECTOR]);
}

if (failures.length > 0) {
  console.error("layer selector check FAILED:\n");
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log("layer selector check passed (next).");
