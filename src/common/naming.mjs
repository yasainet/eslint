import { featuresGlob, PREFIX_LIB_MAPPING } from "./constants.mjs";
import { checkFile } from "./plugins.mjs";

const prefixPattern = `@(${Object.keys(PREFIX_LIB_MAPPING).join("|")})`;

export const namingConfigs = [
  {
    name: "naming/services",
    files: featuresGlob("**/services/*.ts"),
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
    files: featuresGlob("**/repositories/*.ts"),
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
    files: featuresGlob("*/types/*.type.ts"),
    ignores: featuresGlob("shared/types/*.ts"),
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
    files: featuresGlob("shared/types/*.ts"),
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
    files: featuresGlob("**/schemas/*.ts"),
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
    files: featuresGlob("*/utils/*.utils.ts"),
    ignores: featuresGlob("shared/utils/*.ts"),
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
    files: featuresGlob("shared/utils/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": "+([a-z0-9_-]).utils" },
      ],
    },
  },
  {
    name: "naming/constants",
    files: featuresGlob("**/constants/*.ts"),
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
    files: featuresGlob("**/actions/*.ts"),
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": `${prefixPattern}.action` },
      ],
    },
  },
  {
    name: "naming/features-ts-only",
    files: featuresGlob("**/*.tsx"),
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
