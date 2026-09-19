import { localPlugin } from "../local-plugins/index.mjs";

export function createNoAnyReturnConfigs({ featureRoot }) {
  return [
    {
      name: "layers/no-any-return",
      files: [
        `${featureRoot}/**/queries/*.ts`,
        `${featureRoot}/**/services/*.ts`,
      ],
      plugins: { local: localPlugin },
      rules: {
        "local/no-any-return": "error",
      },
    },
  ];
}
