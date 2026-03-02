import { featuresGlob } from "./constants.mjs";
import { localPlugin } from "./local-plugins/index.mjs";
import { checkFile } from "./plugins.mjs";

/** @description Scope naming rules to the given feature root */
export function createNamingConfigs(featureRoot, prefixLibMapping) {
  const prefixPattern = `@(${Object.keys(prefixLibMapping).join("|")})`;
  const sharedPrefixPattern = `@(shared|${Object.keys(prefixLibMapping).join("|")})`;

  const configs = [
    {
      name: "naming/services",
      files: featuresGlob(featureRoot, "**/services/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": `${prefixPattern}.service` },
        ],
      },
    },
    {
      name: "naming/repositories",
      files: featuresGlob(featureRoot, "**/repositories/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": `${prefixPattern}.repo` },
        ],
      },
    },
  ];

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
      files: featuresGlob(featureRoot, "**/schemas/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": `${prefixPattern}.schema` },
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
    {
      name: "naming/actions",
      files: featuresGlob(featureRoot, "**/actions/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": `${prefixPattern}.action` },
        ],
      },
    },
    {
      name: "naming/actions-export",
      files: featuresGlob(featureRoot, "**/actions/*.ts"),
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector:
              "ExportNamedDeclaration > FunctionDeclaration[id.name!=/^handle[A-Z]/]",
            message:
              "Exported functions in actions must start with 'handle' (e.g., handleGetComics).",
          },
        ],
      },
    },
    {
      name: "naming/actions-handle-service",
      files: featuresGlob(featureRoot, "**/actions/*.ts"),
      plugins: { local: localPlugin },
      rules: {
        "local/action-handle-service": "error",
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
