import { featuresGlob } from "../common/constants.mjs";

export const layersConfigs = [
  {
    name: "layers/hooks-naming",
    files: featuresGlob("**/hooks/*.ts"),
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ExportNamedDeclaration > FunctionDeclaration[id.name!=/^use[A-Z]/]",
          message:
            "Exported functions in hooks must start with 'use' (e.g., useAuth).",
        },
      ],
    },
  },
];
