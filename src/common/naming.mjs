import { featuresGlob } from "./constants.mjs";
import { localPlugin } from "./local-plugins/index.mjs";
import { checkFile } from "./plugins.mjs";

/** Scope lib naming rules to the lib root derived from the given feature root. */
export function createLibNamingConfigs(featureRoot) {
  const libRoot = featureRoot.replace(/features$/, "lib");
  return [
    {
      name: "naming/lib",
      files: [`${libRoot}/**/*.ts`],
      ignores: [`${libRoot}/**/*.type.ts`],
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": "*.lib" },
        ],
      },
    },
  ];
}

/** Scope utils naming rules to the utils root derived from the given feature root. */
export function createUtilsNamingConfigs(featureRoot) {
  const utilsRoot = featureRoot.replace(/features$/, "utils");
  return [
    {
      name: "naming/top-level-utils",
      files: [`${utilsRoot}/**/*.ts`],
      ignores: [`${utilsRoot}/**/*.type.ts`],
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": "*.util" },
        ],
      },
    },
  ];
}

/** Scope naming rules to the given feature root. */
export function createNamingConfigs(featureRoot, prefixLibMapping) {
  const prefixes = Object.keys(prefixLibMapping);
  const hasPrefixes = prefixes.length > 0;
  const prefixPattern = hasPrefixes ? `@(${prefixes.join("|")})` : null;
  const sharedPrefixPattern = hasPrefixes
    ? `@(shared|${prefixes.join("|")})`
    : "shared";

  const servicePattern = prefixPattern
    ? `${prefixPattern}.service`
    : "*.service";
  const queryPattern = prefixPattern ? `${prefixPattern}.query` : "*.query";
  const interactorPattern = prefixPattern
    ? `${prefixPattern}.interactor`
    : "*.interactor";

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
          { "**/*.ts": servicePattern },
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
          { "**/*.ts": queryPattern },
        ],
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
          { "**/*.ts": `${sharedPrefixPattern}.service` },
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
          { "**/*.ts": `${sharedPrefixPattern}.query` },
        ],
      },
    },
  );

  configs.push(
    {
      name: "naming/types",
      files: featuresGlob(featureRoot, "*/types/*.type.ts"),
      ignores: featuresGlob(featureRoot, "shared/types/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/types/*.ts": "<1>" },
          { ignoreMiddleExtensions: true },
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
          { "**/*.ts": `${sharedPrefixPattern}.type` },
        ],
      },
    },
    {
      name: "naming/schemas",
      files: featuresGlob(featureRoot, "*/schemas/*.schema.ts"),
      ignores: featuresGlob(featureRoot, "shared/schemas/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/schemas/*.ts": "<1>" },
          { ignoreMiddleExtensions: true },
        ],
      },
    },
    {
      name: "naming/schema-naming",
      files: featuresGlob(featureRoot, "**/schemas/*.schema.ts"),
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
          { "**/*.ts": `${sharedPrefixPattern}.schema` },
        ],
      },
    },
    {
      name: "naming/utils",
      files: featuresGlob(featureRoot, "*/utils/*.util.ts"),
      ignores: featuresGlob(featureRoot, "shared/utils/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/utils/*.ts": "<1>" },
          { ignoreMiddleExtensions: true },
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
          { "**/*.ts": `${sharedPrefixPattern}.util` },
        ],
      },
    },
    {
      name: "naming/constants",
      files: featuresGlob(featureRoot, "*/constants/*.constant.ts"),
      ignores: featuresGlob(featureRoot, "shared/constants/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*/constants/*.ts": "<1>" },
          { ignoreMiddleExtensions: true },
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
          { "**/*.ts": `${sharedPrefixPattern}.constant` },
        ],
      },
    },
  );

  configs.push({
    name: "naming/interactors",
    files: featuresGlob(featureRoot, "**/interactors/*.ts"),
    ignores: featuresGlob(featureRoot, "shared/interactors/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": interactorPattern },
      ],
    },
  });

  configs.push(
    {
      name: "naming/interactors-shared",
      files: featuresGlob(featureRoot, "shared/interactors/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": `${sharedPrefixPattern}.interactor` },
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
