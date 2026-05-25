import { localPlugin } from "../local-plugins/index.mjs";

export function createNoColocatedTestConfigs({ featureRoot }) {
  return [
    {
      name: "test/no-colocated-test",
      files: [
        `${featureRoot}/**/services/**/*.test.{ts,tsx}`,
        `${featureRoot}/**/queries/**/*.test.{ts,tsx}`,
        `${featureRoot}/**/entries/**/*.test.{ts,tsx}`,
      ],
      plugins: { local: localPlugin },
      rules: {
        "local/no-colocated-test": "error",
      },
    },
  ];
}
