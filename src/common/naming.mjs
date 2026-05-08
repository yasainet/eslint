import { featuresGlob } from "./constants.mjs";
import { localPlugin } from "./local-plugins/index.mjs";
import { checkFile } from "./plugins.mjs";

/**
 * Scope lib naming rules to the lib root derived from the given feature root:
 *
 * - basename は suffix なしの単一トークン (`*` パターン) を強制する
 * - 多重拡張子 (`<name>.lib.ts` / `<name>.parser.ts` 等) は禁止 → 役割はディレクトリで宣言する
 * - types.ts は対象外 (型のみで lib の役割を持たないため check 不要)
 */
export function createLibNamingConfigs(featureRoot) {
  const libRoot = featureRoot.replace(/features$/, "lib");
  return [
    {
      name: "naming/lib",
      files: [`${libRoot}/**/*.ts`],
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": "*" },
        ],
      },
    },
  ];
}

/**
 * Scope utils naming rules to the utils root derived from the given feature root:
 *
 * - basename は suffix なしの単一トークン (`*` パターン) を強制する
 * - 多重拡張子は禁止
 */
export function createUtilsNamingConfigs(featureRoot) {
  const utilsRoot = featureRoot.replace(/features$/, "utils");
  return [
    {
      name: "naming/top-level-utils",
      files: [`${utilsRoot}/**/*.ts`],
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": "*" },
        ],
      },
    },
  ];
}

/**
 * Scope naming rules to the given feature root:
 *
 * - 全 layer (services / queries / entries / utils / types / schemas / constants) で suffix を廃止
 * - ファイル名 (basename) は単一トークン (`*` パターン) を強制し、role はディレクトリで宣言する
 * - queries / services / entries のファイル名は prefixLibMapping のキー (lib name) と一致させ、どの lib を呼ぶか明示する
 * - shared/ 配下では feature 名でなく `shared` または lib name を allowed prefix として許可する
 */
export function createNamingConfigs(featureRoot, prefixLibMapping) {
  const prefixes = Object.keys(prefixLibMapping);
  const hasPrefixes = prefixes.length > 0;
  const prefixPattern = hasPrefixes ? `@(${prefixes.join("|")})` : "*";
  const sharedPrefixPattern = hasPrefixes
    ? `@(shared|${prefixes.join("|")})`
    : "shared";

  const configs = [];

  configs.push({
    name: "naming/feature-name",
    files: featuresGlob(featureRoot, "**/*.ts"),
    plugins: { local: localPlugin },
    rules: {
      "local/feature-name": ["error", { featureRoot }],
    },
  });

  configs.push({
    name: "naming/namespace-import-name",
    files: featuresGlob(featureRoot, "**/*.ts"),
    plugins: { local: localPlugin },
    rules: {
      "local/namespace-import-name": ["error", { featureRoot }],
    },
  });

  configs.push(
    {
      name: "naming/services",
      files: featuresGlob(featureRoot, "**/services/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/services/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": prefixPattern },
        ],
      },
    },
    {
      name: "naming/queries",
      files: featuresGlob(featureRoot, "**/queries/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/queries/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": prefixPattern },
        ],
      },
    },
    {
      name: "naming/queries-export",
      files: featuresGlob(featureRoot, "**/queries/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/queries-export": "error",
      },
    },
    {
      name: "naming/queries-namespace-import",
      files: featuresGlob(featureRoot, "**/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/queries-namespace-import": "error",
      },
    },
    {
      name: "naming/supabase-select",
      files: featuresGlob(featureRoot, "**/queries/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/supabase-select-typed-columns": "error",
      },
    },
    {
      name: "naming/supabase-columns-satisfies",
      files: [
        ...featuresGlob(featureRoot, "**/queries/*.ts"),
        ...featuresGlob(featureRoot, "**/constants/*.ts"),
      ],
      plugins: { local: localPlugin },
      rules: {
        "local/supabase-columns-satisfies": "error",
      },
    },
    {
      name: "naming/form-state",
      files: featuresGlob(featureRoot, "**/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/form-state-naming": "error",
      },
    },
  );

  configs.push(
    {
      name: "naming/services-shared",
      files: featuresGlob(featureRoot, "shared/services/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
    {
      name: "naming/queries-shared",
      files: featuresGlob(featureRoot, "shared/queries/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
  );

  configs.push(
    {
      name: "naming/types",
      files: featuresGlob(featureRoot, "*/types/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/types/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/types/*.ts": "<1>" },
        ],
      },
    },
    {
      name: "naming/types-shared",
      files: featuresGlob(featureRoot, "shared/types/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
    {
      name: "naming/schemas",
      files: featuresGlob(featureRoot, "*/schemas/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/schemas/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/schemas/*.ts": "<1>" },
        ],
      },
    },
    {
      name: "naming/schema-naming",
      files: featuresGlob(featureRoot, "**/schemas/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/schema-naming": "error",
      },
    },
    {
      name: "naming/schemas-shared",
      files: featuresGlob(featureRoot, "shared/schemas/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
    {
      name: "naming/utils",
      files: featuresGlob(featureRoot, "*/utils/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/utils/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/utils/*.ts": "<1>" },
        ],
      },
    },
    {
      name: "naming/utils-shared",
      files: featuresGlob(featureRoot, "shared/utils/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
    {
      name: "naming/constants",
      files: featuresGlob(featureRoot, "*/constants/*.ts"),
      ignores: featuresGlob(featureRoot, "shared/constants/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/constants/*.ts": "<1>" },
        ],
      },
    },
    {
      name: "naming/constants-shared",
      files: featuresGlob(featureRoot, "shared/constants/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
  );

  configs.push({
    name: "naming/entries",
    files: featuresGlob(featureRoot, "**/entries/*.ts"),
    ignores: featuresGlob(featureRoot, "shared/entries/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": prefixPattern },
      ],
    },
  });

  configs.push({
    name: "naming/entry-template",
    files: featuresGlob(featureRoot, "**/entries/*.ts"),
    plugins: { local: localPlugin },
    rules: {
      "local/entry-template": "error",
    },
  });

  configs.push(
    {
      name: "naming/entries-shared",
      files: featuresGlob(featureRoot, "shared/entries/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": sharedPrefixPattern },
        ],
      },
    },
    {
      name: "naming/features-ts-only",
      files: featuresGlob(featureRoot, "**/*.tsx"),
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "Program",
            message:
              "features/ must only contain .ts files. Components belong in src/components/.",
          },
        ],
      },
    },
  );

  return configs;
}
