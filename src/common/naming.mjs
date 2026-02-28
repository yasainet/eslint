import { featuresGlob } from "./constants.mjs";
import { checkFile } from "./plugins.mjs";
import { actionHandleServiceRule } from "./local-plugins/action-handle-service.mjs";

/** @description Scope naming rules to the given feature root */
export function createNamingConfigs(featureRoot, prefixLibMapping) {
  const prefixPattern = `@(${Object.keys(prefixLibMapping).join("|")})`;
  return [
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
          { "**/*.ts": "+([a-z0-9_-]).type" },
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
          { "**/*.ts": "+([a-z0-9-]).schema" },
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
          { "**/*.ts": "+([a-z0-9_-]).util" },
        ],
      },
    },
    {
      name: "naming/constants",
      files: featuresGlob(featureRoot, "**/constants/*.ts"),
      plugins: { "check-file": checkFile },
      rules: {
        "check-file/filename-naming-convention": [
          "error",
          { "**/*.ts": "+([a-z0-9-]).constant" },
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
      plugins: {
        local: {
          rules: { "action-handle-service": actionHandleServiceRule },
        },
      },
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
  ];
}
